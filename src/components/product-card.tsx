import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart, Leaf } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  price?: string;
  benefits: string[];
  orderLink?: string;
}

export default function ProductCard({ name, description, imageUrl, imageHint, price, benefits, orderLink = "#order" }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <Image 
            src={imageUrl} 
            alt={name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={imageHint}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-2xl text-foreground mb-2">{name}</CardTitle>
        <CardDescription className="text-base text-muted-foreground mb-4">{description}</CardDescription>
        <div className="mb-4">
          <h4 className="font-semibold text-foreground mb-1">Key Benefits:</h4>
          <ul className="list-none space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-sm text-muted-foreground">
                <Leaf className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row justify-between items-center">
        {price && <p className="text-xl font-bold text-primary mb-4 sm:mb-0">{price}</p>}
        <Button asChild className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
          <Link href={orderLink}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Order Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
