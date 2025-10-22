import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-heading mb-4">
          Welcome to MemPPI-Atlas
        </h2>
        <p className="text-lg text-body">
          Interactive web platform for visualizing and exploring protein-protein
          interaction (PPI) networks.
        </p>
        <p className="text-body mt-4">
          This is the initial setup. Network visualization will be added in the
          next milestones.
        </p>
      </main>
    </div>
  );
}
