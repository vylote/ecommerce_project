import Navbar from '../../shared/components/Navbar';
import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-12 py-6 space-y-6">
        <CategorySection />
        <ProductSection />
      </div>
    </div>
  );
}