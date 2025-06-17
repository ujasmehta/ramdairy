
import Image from 'next/image';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Milk, Leaf, ShieldCheck, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CustomerOrderSearch from '@/components/products/customer-order-search';

const productsData = [
  {
    name: 'Pure GIR Cow A2 Milk',
    description: 'Fresh, raw, and unprocessed A2 milk from our pasture-raised GIR cows. Delivered chilled to preserve its natural goodness.',
    imageUrl: 'https://placehold.co/600x600.png',
    imageHint: 'milk bottle glass',
    price: '80 / liter',
    benefits: ['Rich in A2 Beta-Casein Protein', 'Easier to digest', 'Boosts immunity', 'Supports bone health'],
  },
  {
    name: 'Artisanal GIR Cow Ghee',
    description: 'Traditionally prepared Vedic Ghee (clarified butter) from A2 milk. Golden, aromatic, and packed with nutrients.',
    imageUrl: 'https://placehold.co/600x600.png',
    imageHint: 'ghee jar product',
    price: '500 / 500g',
    benefits: ['Rich in Omega-3 & Omega-9', 'Aids digestion', 'Boosts metabolism', 'Nourishes skin and hair'],
  },
  {
    name: 'Organic GIR Cow Curd (Dahi)',
    description: 'Creamy, probiotic-rich curd made from our A2 milk. Set traditionally for an authentic taste and texture.',
    imageUrl: 'https://placehold.co/600x600.png',
    imageHint: 'curd bowl',
    price: '40 / 500g',
    benefits: ['Improves gut health', 'Rich in Calcium and Vitamin B12', 'Cooling effect on the body', 'Natural probiotic source'],
  },
  {
    name: 'Hand-Churned GIR Cow Butter',
    description: 'Delicious, unsalted white butter (Makkhan) made using traditional methods. Perfect for a healthy and tasty addition to your meals.',
    imageUrl: 'https://placehold.co/600x600.png',
    imageHint: 'butter block',
    price: '120 / 250g',
    benefits: ['Contains healthy fats', 'Rich in Vitamin A & D', 'No preservatives or artificial colors', 'Authentic traditional taste'],
  },
];

const qualityAspects = [
  { icon: Leaf, title: "100% Organic", description: "Our cows graze on pesticide-free pastures, ensuring milk free from harmful chemicals." },
  { icon: ShieldCheck, title: "A2 Protein Rich", description: "GIR cow milk is naturally rich in A2 beta-casein protein, known for its health benefits." },
  { icon: Heart, title: "Ethically Sourced", description: "We prioritize the well-being of our cows, ensuring they live happy, stress-free lives." },
];

export default function ProductsPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Milk className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Our Pure & Organic <span className="text-primary">Dairy Delights</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the unique qualities and health benefits of products made from GIR cow milk. Each item is crafted with care, preserving the natural goodness and traditional flavors.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {productsData.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </div>
      </section>

      <section id="quality" className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
              The <span className="text-primary">RamDairyFarm</span> Quality Promise
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We are committed to providing you with the highest quality, most wholesome dairy products.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {qualityAspects.map(aspect => (
              <div key={aspect.title} className="text-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <aspect.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-headline text-2xl font-semibold text-foreground mb-2">{aspect.title}</h3>
                <p className="text-muted-foreground">{aspect.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="order" className="py-16 md:py-24">
        <CustomerOrderSearch />
        
        <div className="container mx-auto px-4 text-center mt-12 md:mt-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Experience the Purity?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Currently, we are accepting orders via phone or email. Please contact us to place your order or inquire about delivery in your area. Online ordering coming soon!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Button size="lg" asChild className="shadow-lg">
              <a href="tel:+919979540446">Call Us: (997) 954-0446</a>
            </Button>
            <Button size="lg" variant="outline" asChild className="shadow-lg">
              <a href="mailto:support@ramdairyfarm.in">Email: support@ramdairyfarm.in</a>
            </Button>
          </div>
           <p className="mt-12 text-sm text-muted-foreground">
            We are working on an online ordering system for your convenience. Stay tuned!
          </p>
        </div>
      </section>
    </div>
  );
}
