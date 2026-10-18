import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { Profile } from "@/components/profile-form";

export const metadata: Metadata = { title: "Meu perfil" };

export default function ProfilePage() {
  return (
    <>
      <PageTitle eyebrow="Meu perfil">
        Quem é você no <em>campus</em>
      </PageTitle>
      <Profile />
    </>
  );
}
