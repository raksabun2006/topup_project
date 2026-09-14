import CustomerFacingDisplay from '../components/pos/CustomerFacingDisplay';
import SEO from '../components/SEO';

export default function PosCustomerDisplayPage() {
  return (
    <>
      <SEO
        title="Customer Display | Mart System"
        description="Mart System Customer Facing Display for In-Store Registers"
        noindex={true}
        robots="noindex, nofollow"
      />
      <CustomerFacingDisplay />
    </>
  );
}
