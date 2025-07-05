"use client";

import { usePersonManager } from "@/hooks/usePersonManager";
import OmikujiWheel from "@/components/OmikujiWheel";
import PersonRegistration from "@/components/PersonRegistration";
import ShareButton from "@/components/ShareButton";

export default function Home() {
  const { persons, registerPerson, removePerson } = usePersonManager();

  const handlePersonRegister = (name: string) => {
    try {
      registerPerson(name);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const names = persons.map((p) => p.name);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 rounded-lg">
        <OmikujiWheel persons={persons} />
        <PersonRegistration
          persons={persons}
          onPersonRegister={handlePersonRegister}
          onPersonRemove={removePerson}
        />

        <ShareButton names={names} />
      </div>
    </main>
  );
}
