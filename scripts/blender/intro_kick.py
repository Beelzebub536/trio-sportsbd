"""Renders the first-visit intro: a football is kicked, swerves toward the camera in slow
motion and flies over it, on an off-white studio ground.

Run headless (does not touch any open Blender session):
  blender -b --factory-startup -P scripts/blender/intro_kick.py -- OUT_DIR WIDTH HEIGHT [START END [STEP]]
Frames are written as OUT_DIR/f####.jpg; encode them with scripts/blender/encode_intro.mjs.

In an open Blender session, exec this file under another __name__ and call build_scene(w, h) on an
empty scene to get the same set-up for hand editing.
"""

import math
import sys

import bmesh
import bpy
from mathutils import Vector

FPS = 30
END = 96
BALL_R = 0.11  # a size-5 ball is ~22 cm across
STUDIO = (0.90, 0.875, 0.83)  # warm off-white studio floor and wall
AMBIENT = (0.96, 0.95, 0.93)


def srgb_to_linear(c):
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def material(name, color, roughness, coat=0.0):
    mat = bpy.data.materials.new(name)
    if hasattr(mat, "use_nodes"):  # always on (and deprecated) in Blender 5
        mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*srgb_to_linear(color), 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = 0.25
    return mat


def make_ball():
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
    bpy.context.collection.objects.link(ball)
    # Simple (not Catmull-Clark) subdivision keeps the panel shapes; Cast rounds them onto a sphere.
    subdiv = ball.modifiers.new("Subdivision", "SUBSURF")
    subdiv.subdivision_type = "SIMPLE"
    subdiv.levels = subdiv.render_levels = 3
    cast = ball.modifiers.new("Round", "CAST")
    cast.cast_type = "SPHERE"
    cast.factor = 1.0
    ball.scale = (BALL_R,) * 3
    for mat in (
        material("Leather", (0.93, 0.93, 0.91), 0.36, coat=0.35),
        material("Panel", (0.035, 0.035, 0.04), 0.32, coat=0.35),
        material("Seam", (0.42, 0.42, 0.40), 0.75),
    ):
        mesh.materials.append(mat)
    return ball


def key(obj, frame, **props):
    for name, value in props.items():
        setattr(obj, name, value)
        obj.keyframe_insert(name, frame=frame)


def make_cove():
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
    bpy.context.collection.objects.link(cove)
    mat = material("Studio", STUDIO, 0.95)
    mat.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.15
    mesh.materials.append(mat)
    return cove


def screen_point(scene, cam, sx, sy, depth):
    """World position that appears at (sx, sy) in the frame (0..1, origin bottom-left) at `depth` metres."""
    tr, br, bl, tl = cam.data.view_frame(scene=scene)
    local = Vector((bl.x + (br.x - bl.x) * sx, bl.y + (tl.y - bl.y) * sy, tr.z))
    return cam.matrix_world @ (local * (depth / -tr.z))


def build_scene(width, height):
    scene = bpy.context.scene
    for obj in list(scene.objects):
        bpy.data.objects.remove(obj)

    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 48
    scene.render.fps = FPS
    scene.frame_start, scene.frame_end = 1, END
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.resolution_percentage = 100
    scene.render.use_motion_blur = True
    scene.render.motion_blur_shutter = 0.5
    scene.view_settings.view_transform = "Standard"  # keep the off-white true to the site palette

    world = bpy.data.worlds.new("Studio")
    scene.world = world
    if hasattr(world, "use_nodes"):
        world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (*srgb_to_linear(AMBIENT), 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55

    make_cove()

    bpy.ops.object.light_add(type="AREA", location=(-2.0, -1.0, 3.4))
    key_light = bpy.context.object
    key_light.data.energy = 230
    key_light.data.size = 4.0
    key_light.rotation_euler = (math.radians(20), math.radians(-30), 0)

    bpy.ops.object.camera_add(location=(0, -3.2, 0.34), rotation=(math.radians(87.5), 0, 0))
    cam = bpy.context.object
    scene.camera = cam
    cam.data.lens = 35
    cam.data.sensor_fit = "AUTO"
    bpy.context.view_layer.update()
    # Shallow focus that follows the ball, like a real slow-motion camera.
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 2.0

    ball = make_ball()
    ball.rotation_mode = "XYZ"
    cam.data.dof.focus_object = ball
    rest = Vector((0, 0, BALL_R))

    # Rest, then the strike: squash against the boot, rebound, settle.
    key(ball, 1, location=rest, scale=(BALL_R,) * 3, rotation_euler=(0, 0, 0))
    key(ball, 14, location=rest, scale=(BALL_R,) * 3)
    key(ball, 16, scale=(BALL_R * 1.12, BALL_R * 1.12, BALL_R * 0.84))
    key(ball, 19, scale=(BALL_R * 0.95, BALL_R * 0.95, BALL_R * 1.07))
    key(ball, 23, scale=(BALL_R,) * 3)

    # Flight planned in screen space (x, y in 0..1 of the frame, depth in metres from the lens), so
    # it stays framed in both landscape and portrait: it swerves out left, curls back right as it
    # rises at the lens, then leaves over the top-right corner. Keys are bunched between frames
    # ~30 and ~80, which is what makes the approach play in slow motion.
    path = [
        (22, 0.40, 0.46, 2.55),
        (30, 0.31, 0.52, 2.0),
        (46, 0.33, 0.57, 1.45),
        (66, 0.45, 0.59, 1.05),
        (80, 0.57, 0.60, 0.72),
        (86, 0.92, 1.05, 0.34),
        (91, 2.4, 2.8, 0.3),  # fully out of frame before the last frames
    ]
    key(ball, 16, location=rest)
    for frame, sx, sy, depth in path:
        key(ball, frame, location=screen_point(scene, cam, sx, sy, depth))
    # Sidespin to match the curl, plus a little topspin.
    for frame, z, x in [(16, 0, 0), (30, -7.5, 1.5), (80, -9.2, 2.0), (91, -13.0, 2.8)]:
        key(ball, frame, rotation_euler=(x, 0, z))

    # Tiny camera jolt on impact so the strike has weight.
    key(cam, 15, location=(0, -3.2, 0.34))
    key(cam, 16, location=(0.004, -3.2, 0.336))
    key(cam, 18, location=(0, -3.2, 0.34))
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
