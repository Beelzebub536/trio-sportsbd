"""Renders the first-visit intro: a scuffed football is kicked in a dark studio, swerves toward the
camera in slow motion and flies straight into the lens, filling the frame so the site can be
revealed from behind it.

Run headless (does not touch any open Blender session):
  blender -b --factory-startup -P scripts/blender/intro_kick.py -- OUT_DIR WIDTH HEIGHT [START END [STEP]]
Frames are written as OUT_DIR/f####.jpg; encode them with scripts/blender/encode_intro.mjs.

In an open Blender session, exec this file under another __name__ and call build_scene(w, h) on an
empty scene to get the same set-up for hand editing.
"""

import bisect
import math
import sys

import bmesh
import bpy
from mathutils import Vector

FPS = 30
END = 96
BALL_R = 0.11  # a size-5 ball is ~22 cm across
REST_Z = 0.095  # centre height at rest: pressed ~1.5 cm into the floor so it reads as sitting on it
KICK = 16  # frame the boot strikes the ball
SPIN = 0.55  # sidespin in radians per frame at full speed (~2.6 turns a second)
SPIN_SLOWMO = 0.45  # spin keeps more of its speed than the flight does in slow motion
EXIT = 90  # frame the ball reaches the lens and fills the frame
# One cubic Bezier carries the whole flight, so the path can never kink. Control points are given in
# screen space (x, y as 0..1 of the frame, depth in metres from the lens) so it frames the same way
# in portrait and landscape: one wide arc up and out to the left that curls back down into the
# lens. The last control point sits on the lens axis so the ball glides into frame centre.
FLIGHT = [(0.0, 0.85, 2.0), (0.62, 0.55, 1.0), (0.5, 0.5, 0.16)]
STUDIO = (0.05, 0.06, 0.057)  # dark charcoal floor and wall, close to the site's background
AMBIENT = (0.05, 0.06, 0.058)
# Squash and wobble on the strike (horizontal, vertical scale): flattened against the boot, then a
# quick damped jiggle as it leaves.
SQUASH = [(14, 1.0, 1.0), (KICK, 1.22, 0.72), (18, 0.88, 1.18), (21, 1.08, 0.9), (25, 0.96, 1.05),
          (30, 1.02, 0.98), (36, 1.0, 1.0)]


def srgb_to_linear(c):
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def material(name, color, roughness, coat=0.0, dirt=0.0):
    mat = bpy.data.materials.new(name)
    if hasattr(mat, "use_nodes"):  # always on (and deprecated) in Blender 5
        mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*srgb_to_linear(color), 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = 0.25
    if dirt:
        add_dirt(mat, color, roughness, dirt)
    return mat


def add_dirt(mat, color, roughness, amount):
    """Grime patches plus fine scuffs, in object space so they stay put on the spinning ball."""
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes["Principled BSDF"]
    coords = nodes.new("ShaderNodeTexCoord")

    def mask(scale, low, high):
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = scale
        noise.inputs["Detail"].default_value = 10
        noise.inputs["Roughness"].default_value = 0.65
        links.new(coords.outputs["Object"], noise.inputs["Vector"])
        ramp = nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[1].position = low, high
        links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
        return ramp

    grime, scuff = mask(3.0, 0.48, 0.78), mask(38.0, 0.62, 0.7)
    both = nodes.new("ShaderNodeMath")
    both.operation = "MAXIMUM"
    links.new(grime.outputs["Color"], both.inputs[0])
    links.new(scuff.outputs["Color"], both.inputs[1])
    strength = nodes.new("ShaderNodeMath")
    strength.operation = "MULTIPLY"
    strength.inputs[1].default_value = amount
    links.new(both.outputs[0], strength.inputs[0])

    tint = nodes.new("ShaderNodeMix")  # clean colour -> muddy brown-green
    tint.data_type = "RGBA"
    tint.inputs[6].default_value = (*srgb_to_linear(color), 1)
    tint.inputs[7].default_value = (*srgb_to_linear((0.42, 0.38, 0.3)), 1)
    links.new(strength.outputs[0], tint.inputs[0])
    links.new(tint.outputs[2], bsdf.inputs["Base Color"])

    rough = nodes.new("ShaderNodeMapRange")  # dirt is matte
    rough.inputs["To Min"].default_value = roughness
    rough.inputs["To Max"].default_value = 0.85
    links.new(strength.outputs[0], rough.inputs["Value"])
    links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])


def make_ball(scene):
    """Truncated icosahedron (12 pentagons, 20 hexagons) with seams, rounded into a sphere."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0)
    assert len(bm.faces) == 20, len(bm.faces)
    bmesh.ops.bevel(bm, geom=list(bm.verts), offset=100 / 3, offset_type="PERCENT", affect="VERTICES")
    sides = sorted(len(f.verts) for f in bm.faces)
    assert sides.count(5) == 12 and sides.count(6) == 20, sides

    for face in bm.faces:
        face.material_index = 1 if len(face.verts) == 5 else 0
    seams = bmesh.ops.inset_individual(bm, faces=list(bm.faces), thickness=0.035, depth=0)["faces"]
    for face in seams:
        face.material_index = 2

    mesh = bpy.data.meshes.new("Ball")
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True

    ball = bpy.data.objects.new("Ball", mesh)
    scene.collection.objects.link(ball)
    # Simple (not Catmull-Clark) subdivision keeps the panel shapes; Cast rounds them onto a sphere.
    subdiv = ball.modifiers.new("Subdivision", "SUBSURF")
    subdiv.subdivision_type = "SIMPLE"
    subdiv.levels = subdiv.render_levels = 3
    cast = ball.modifiers.new("Round", "CAST")
    cast.cast_type = "SPHERE"
    cast.factor = 1.0
    cast.use_radius_as_size = False  # otherwise `size` is ignored and the ball comes out ~15% small
    cast.size = 1.0  # exact unit radius, so object scale == ball radius
    ball.scale = (BALL_R,) * 3
    for mat in (
        material("Leather", (0.9, 0.9, 0.87), 0.4, coat=0.3, dirt=0.75),
        material("Panel", (0.035, 0.035, 0.04), 0.35, coat=0.3, dirt=0.35),
        material("Seam", (0.32, 0.31, 0.29), 0.8),
    ):
        mesh.materials.append(mat)
    return ball


def slowmo(frame, floor=0.3):
    """Playback speed: 1 is real time, easing smoothly down to `floor` as the ball nears the lens."""
    t = min(max((frame - 24) / 26, 0.0), 1.0)
    return 1 - (1 - floor) * t * t * (3 - 2 * t)


def clock(frame, floor=0.3):
    """Camera time since the kick: real frames scaled by the slow-motion ramp (plus a two-frame
    launch). Flight and spin share the ramp, so they slow down together."""
    return sum(slowmo(f, floor) * min(1.0, (f - KICK) / 2) for f in range(KICK + 1, frame + 1))


def channelbag(obj):
    return obj.animation_data.action.layers[0].strips[0].channelbags[0]


def bake(obj, path, values):
    """Replaces `path` animation on obj with one LINEAR key per frame from values(frame)."""
    if obj.animation_data and obj.animation_data.action:
        bag = channelbag(obj)
        for curve in [c for c in bag.fcurves if c.data_path == path]:
            bag.fcurves.remove(curve)
    for frame in range(1, END + 1):
        setattr(obj, path, values(frame))
        obj.keyframe_insert(path, frame=frame)
    for curve in channelbag(obj).fcurves:
        if curve.data_path == path:
            for point in curve.keyframe_points:
                point.interpolation = "LINEAR"


def bake_spin(ball):
    """One continuous spin keyed every frame: it starts on the kick and eases into slow motion
    without ever stopping and restarting."""
    def rotation(frame):
        angle = SPIN * clock(frame, SPIN_SLOWMO)
        return (angle * 0.25, 0, -angle)  # sidespin for the curl plus a little topspin

    bake(ball, "rotation_euler", rotation)


def squash_at(frame):
    if frame <= SQUASH[0][0]:
        return SQUASH[0][1:]
    for (f0, h0, v0), (f1, h1, v1) in zip(SQUASH, SQUASH[1:]):
        if frame <= f1:
            t = (frame - f0) / (f1 - f0)
            t = t * t * (3 - 2 * t)
            return h0 + (h1 - h0) * t, v0 + (v1 - v0) * t
    return SQUASH[-1][1:]


def bake_rig(rig, scene, cam):
    """Flight and squash live on the rig (world axes); the ball inside it only spins. The flight is
    one curve walked at constant speed in camera time."""
    rest = Vector((0, 0, REST_Z))
    points = [rest] + [screen_point(scene, cam, *c) for c in FLIGHT]

    def at(u):
        a = 1 - u
        return points[0] * a**3 + points[1] * 3 * a * a * u + points[2] * 3 * a * u * u + points[3] * u**3

    steps = 800  # arc-length table so equal camera time means equal distance travelled
    samples = [at(i / steps) for i in range(steps + 1)]
    lengths = [0.0]
    for p, q in zip(samples, samples[1:]):
        lengths.append(lengths[-1] + (q - p).length)
    total, duration = lengths[-1], clock(EXIT)

    def location(frame):
        if frame <= KICK:
            # Lower the centre with the squash so the bottom stays pressed into the floor.
            return rest - Vector((0, 0, BALL_R * (1 - squash_at(frame)[1])))
        target = min(total * clock(frame) / duration, total)
        i = min(bisect.bisect_left(lengths, target), steps)
        return samples[i - 1].lerp(samples[i], (target - lengths[i - 1]) / (lengths[i] - lengths[i - 1]))

    def scale(frame):
        h, v = squash_at(frame)
        return (h, h, v)

    bake(rig, "location", location)
    bake(rig, "scale", scale)


def make_cove(scene):
    """Photo-studio cove: a floor that curves up into a back wall, so there is no horizon line."""
    radius, wall_y, half_width = 4.0, 7.0, 25.0
    profile = [(-12.0, 0.0), (wall_y - radius, 0.0)]
    for i in range(1, 17):
        a = i / 16 * math.pi / 2
        profile.append((wall_y - radius + radius * math.sin(a), radius - radius * math.cos(a)))
    profile.append((wall_y, 16.0))

    bm = bmesh.new()
    rows = [(bm.verts.new((-half_width, y, z)), bm.verts.new((half_width, y, z))) for y, z in profile]
    for (a0, a1), (b0, b1) in zip(rows, rows[1:]):
        bm.faces.new((a0, a1, b1, b0))
    mesh = bpy.data.meshes.new("Cove")
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    cove = bpy.data.objects.new("Cove", mesh)
    scene.collection.objects.link(cove)
    mat = material("Studio", STUDIO, 0.8)
    mat.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.2
    mesh.materials.append(mat)
    return cove


def screen_point(scene, cam, sx, sy, depth):
    """World position that appears at (sx, sy) in the frame (0..1, origin bottom-left) at `depth` metres."""
    tr, br, bl, tl = cam.data.view_frame(scene=scene)
    local = Vector((bl.x + (br.x - bl.x) * sx, bl.y + (tl.y - bl.y) * sy, tr.z))
    return cam.matrix_world @ (local * (depth / -tr.z))


def add_object(scene, name, data, location=(0, 0, 0), rotation=(0, 0, 0)):
    """Created through bpy.data (not operators) so it works the same headless and in a live session."""
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    obj.rotation_euler = [math.radians(a) for a in rotation]
    scene.collection.objects.link(obj)
    return obj


def area_light(scene, name, location, rotation, energy, size, color=(1, 1, 1)):
    light = bpy.data.lights.new(name, "AREA")
    light.energy, light.size, light.color = energy, size, color
    return add_object(scene, name, light, location, rotation)


def build_scene(width, height):
    scene = bpy.context.scene
    view_layer = scene.view_layers[0]
    view_layer.objects.active = None  # nothing may keep pointing at the objects removed below
    for obj in list(scene.objects):
        obj.select_set(False, view_layer=view_layer)
        bpy.data.objects.remove(obj)

    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 48
    scene.render.fps = FPS
    scene.frame_start, scene.frame_end = 1, END
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.resolution_percentage = 100
    scene.render.use_motion_blur = True
    scene.render.motion_blur_shutter = 0.5
    scene.view_settings.view_transform = "Standard"  # keep colours true to the site palette

    world = bpy.data.worlds.new("Studio")
    scene.world = world
    if hasattr(world, "use_nodes"):
        world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (*srgb_to_linear(AMBIENT), 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.4

    make_cove(scene)
    # Overhead key along the flight line (a soft pool of light on the floor that keeps lighting the
    # ball as it approaches) and a gentle fill from camera left.
    area_light(scene, "Key Light", (-0.4, -1.4, 2.8), (12, -8, 0), 190, 2.6)
    area_light(scene, "Fill Light", (-1.8, -3.0, 1.0), (75, 0, -55), 35, 2.0)

    cam = add_object(scene, "Intro Camera", bpy.data.cameras.new("Intro Camera"), (0, -3.2, 0.34), (92.5, 0, 0))
    scene.camera = cam
    cam.data.lens = 35
    cam.data.sensor_fit = "AUTO"
    cam.data.clip_start = 0.01  # the ball ends a few centimetres from the lens
    scene.view_layers[0].update()

    rig = add_object(scene, "Ball Rig", None)
    rig.empty_display_type, rig.empty_display_size = "SPHERE", BALL_R
    ball = make_ball(scene)
    ball.parent = rig
    ball.rotation_mode = "XYZ"

    # Shallow focus that follows the ball, like a real slow-motion camera.
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 2.0
    cam.data.dof.focus_object = ball

    bake_rig(rig, scene, cam)
    bake_spin(ball)

    # Tiny camera jolt on impact so the strike has weight.
    for frame, loc in [(15, (0, -3.2, 0.34)), (16, (0.004, -3.2, 0.336)), (18, (0, -3.2, 0.34))]:
        cam.location = loc
        cam.keyframe_insert("location", frame=frame)
    return scene


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    out_dir, width, height = argv[0], int(argv[1]), int(argv[2])
    scene = build_scene(width, height)
    if len(argv) >= 5:
        scene.frame_start, scene.frame_end = int(argv[3]), int(argv[4])
    if len(argv) >= 6:
        scene.frame_step = int(argv[5])
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 92
    scene.render.filepath = f"{out_dir}/f####"
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":  # headless render; importing it in a live session only defines build_scene
    main()
