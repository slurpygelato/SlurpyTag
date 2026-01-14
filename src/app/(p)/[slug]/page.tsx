export default function PetProfilePage({ params }: { params: { slug: string } }) {
    return (
      <main className="p-10 text-center">
        <h1 className="slurpy-logo">Profilo di {params.slug}</h1>
        <p className="font-patrick">Qui vedremo il profilo pubblico del cane.</p>
      </main>
    );
  }