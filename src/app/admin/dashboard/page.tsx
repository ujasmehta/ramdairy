
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, ListChecks, Milk, Users, Package } from "lucide-react";
import Link from "next/link";

const overviewItems = [
  { title: "Manage Cows", href: "/admin/cows", icon: Beef, description: "View, add, and edit cow profiles." },
  { title: "Feed Logs", href: "/admin/feed", icon: ListChecks, description: "Track daily feed for each cow." },
  { title: "Milk Production", href: "/admin/milk", icon: Milk, description: "Record daily milk yields." },
  { title: "Orders", href: "/admin/orders", icon: Package, description: "View and update customer orders." },
  { title: "Customers", href: "/admin/customers", icon: Users, description: "Manage customer information.", disabled: false },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b">
        <h1 className="text-4xl font-headline font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Welcome to the RamDairyFarm Admin Portal. Manage your farm operations efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewItems.map(item => (
          <Card 
            key={item.title} 
            className={`shadow-md hover:shadow-lg transition-shadow ${item.disabled ? 'opacity-60 bg-muted/50' : 'bg-card'}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline font-semibold">{item.title}</CardTitle>
              <item.icon className={`h-6 w-6 ${item.disabled ? 'text-muted-foreground' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              {item.disabled ? (
                <span className="text-xs text-muted-foreground italic">Coming soon</span>
              ) : (
                <Link href={item.href} className="text-sm font-medium text-primary hover:underline">
                  Go to {item.title} &rarr;
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
       <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the navigation on the left to access different management sections. All sections are now active.
          </p>
          <p className="text-muted-foreground mt-2">
            Ensure your Firebase setup in the <code className="text-xs bg-muted p-1 rounded">.env</code> file is correct for authentication to work properly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    