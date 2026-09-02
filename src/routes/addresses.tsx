import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { AddressCard } from "@/components/AddressCard";
import { CustomerLayout } from "@/components/CustomerLayout";
import { EmptyState } from "@/components/EmptyState";
import { mockAddresses } from "@/data/mock";
import { feedback } from "@/lib/feedback";
import type { Address } from "@/data/types";

export const Route = createFileRoute("/addresses")({
  head: () => ({
    meta: [
      { title: "Delivery addresses — FoodRush" },
      {
        name: "description",
        content: "Manage the Lagos addresses FoodRush riders deliver your orders to.",
      },
      { property: "og:title", content: "Delivery addresses — FoodRush" },
      {
        property: "og:description",
        content: "Save home, work and other drop-off spots for faster FoodRush checkout.",
      },
    ],
  }),
  component: AddressesPage,
});

function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [selectedId, setSelectedId] = useState(
    mockAddresses.find((address) => address.isDefault)?.id ?? mockAddresses[0]?.id,
  );

  const removeAddress = (address: Address) => {
    setAddresses((current) => current.filter((item) => item.id !== address.id));
    feedback.deleted(`${address.label} address`);
  };

  return (
    <CustomerLayout
      title="Delivery addresses"
      description="Pick a default drop-off spot so checkout stays a two-tap job."
      actions={
        <button
          type="button"
          onClick={() => feedback.info("Adding addresses arrives with the API integration.")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" aria-hidden /> New address
        </button>
      }
    >
      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add a delivery address and it will show up here for every future order."
          action={
            <Link
              to="/restaurants"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Browse restaurants
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={address.id === selectedId}
              onSelect={() => {
                setSelectedId(address.id);
                feedback.saved(`${address.label} address`);
              }}
              onDelete={() => removeAddress(address)}
            />
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
