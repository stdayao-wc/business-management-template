import Navbar from "@/components/layout/Navbar";
import navigation from "./config/navigation";
export default function Home() {


  return (
    <div className="flex">
      <Navbar links={navigation} />

      <main className="flex-1 p-8">
        <h1>Dashboard</h1>
      </main>
    </div>
  );
}