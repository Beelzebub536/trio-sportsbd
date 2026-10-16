import type { Metadata } from "next";

import StaticPage from "@/components/layout/StaticPage";

export const metadata: Metadata = {
  title: "About us",
  description: "Who we are and how Trio Sports BD serves athletes in Bangladesh.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Trio Sports BD"
      intro="Kit for players, teams and fans across Bangladesh."
    >
      <p>
        Trio Sports BD started with a simple idea: make good sports kit
        affordable and easy to buy anywhere in Bangladesh — not just in the big
        city stores. Today we stock jerseys, training trousers and everyday
        accessories for football, cricket and the gym.
      </p>

      <h2>What we sell</h2>
      <ul>
        <li>
          <strong>Jerseys</strong> — football and cricket, for men, women and kids.
        </li>
        <li>
          <strong>Trousers</strong> — track pants and training shorts built to move.
        </li>
        <li>
          <strong>Accessories</strong> — duffle bags, backpacks, socks, caps and gloves.
        </li>
      </ul>

      <h2>How we work</h2>
      <p>
        Payment is cash on delivery. You pay a 10% advance through bKash or
        Nagad to confirm the order, and the rest when the parcel arrives. Every
        question is answered on WhatsApp — there is no call centre and no email
        queue.
      </p>

      <h2>Team and bulk orders</h2>
      <p>
        Ordering for a club, school or corporate team? Message us on WhatsApp
        with your quantities, sizes and printing requirements and we will quote
        you a bulk price.
      </p>
    </StaticPage>
  );
}
