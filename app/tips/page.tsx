import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TipsContent from "./TipsContent";

export default function TipsPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header />
      <TipsContent />
      <BottomNav />
    </div>
  );
}
