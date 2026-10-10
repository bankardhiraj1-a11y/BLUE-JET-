import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  GraduationCap,
  Globe2,
  Landmark,
  MapPin,
  Plane,
  ShieldCheck,
  Train,
  Users,
  UserRound,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contacts, type EnquiryKind } from '@/lib/travel';

type TravelAction = (kind: EnquiryKind) => void;
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

const tourFormats = [
  {
    value: 'customized' as const,
    kind: 'Customized tour' as const,
    tab: 'Customized tours',
    image: 'mauritius-lagoon.webp',
    kicker: 'MADE AROUND YOUR BRIEF',
    title: 'Your places. Your pace.',
    icon: Compass,
    description: 'Start with a destination, a date, or a list of things you want to experience. Share the brief and the team can discuss a route and itinerary tailored to your group.',
    details: ['Domestic or international routes', 'Your preferred dates and travel pace', 'A written quotation before you decide'],
  },
  {
    value: 'groups' as const,
    kind: 'Group tour (16+ travellers)' as const,
    tab: 'Groups · 16+',
    image: 'kashmir-dal-lake.webp',
    kicker: 'FOR PARTIES OF 16 OR MORE',
    title: 'Bring everyone along.',
    icon: Users,
    description: 'Tell us who is travelling, the route you have in mind, and what the group needs. We will review the request and discuss a plan with the group lead.',
    details: ['Group size starts at 16 travellers', 'One enquiry from the nominated organiser', 'Final availability and inclusions confirmed in writing'],
  },
  {
    value: 'private' as const,
    kind: 'Private tour (up to 11 travellers)' as const,
    tab: 'Private · up to 11',
    image: 'kerala-backwaters.webp',
    kicker: 'FOR PRIVATE PARTIES OF UP TO 11',
    title: 'Keep the trip close-knit.',
    icon: UserRound,
    description: 'A private-trip enquiry for couples, families, or a small party. Share your destination and preferred pace so the team can plan around the people going.',
    details: ['Private parties up to 11 travellers', 'Share access or pacing requirements', 'The itinerary and quote are discussed with you'],
  },
  {
    value: 'international-study' as const,
    kind: 'International student study tour' as const,
    tab: 'International study',
    image: 'malaysia-kuala-lumpur.webp',
    kicker: 'LEARNING BEYOND THE CLASSROOM',
    title: 'International study tours.',
    icon: Globe2,
    description: 'Schools and colleges can enquire about learning-focused travel outside India. Share the subject, age band, group size, and preferred travel window—not individual student records.',
    details: ['For school and college groups', 'Educational focus and adult lead contact', 'Entry rules, permissions, and access checked before booking'],
  },
  {
    value: 'domestic-study' as const,
    kind: 'Domestic student study tour' as const,
    tab: 'Domestic study',
    image: 'rajasthan-udaipur.webp',
    kicker: 'INDIA, THROUGH A LEARNING LENS',
    title: 'Domestic study tours.',
    icon: GraduationCap,
    description: 'Plan a school or college group visit within India, shaped around the curriculum and time available. Science and space-learning visits, including suitable ISRO-related destinations, depend on public access, centre schedules, and prior approval.',
    details: ['For domestic school and college groups', 'ISRO-related visits are not guaranteed or an official partnership', 'Please do not include children’s names or sensitive information'],
  },
];

const spiritualRoutes = [
  { title: 'Jyotirlinga journeys', text: 'Discuss a route that connects the shrines your group wants to visit.', symbol: '१२' },
  { title: 'Ashtavinayaka', text: 'Plan travel between the eight Ganpati temples of Maharashtra.', symbol: '८' },
  { title: 'Char Dham', text: 'Talk through a four-shrine pilgrimage plan, route, and travel pace.', symbol: '४' },
  { title: 'Kedarnath', text: 'Ask about a Kedarnath-focused itinerary and the current travel requirements.', symbol: 'ॐ' },
];

export function TripFormats({ onEnquire }: { onEnquire: TravelAction }) {
  return (
    <section id="trip-formats" className="trip-formats section wrap">
      <div className="section-heading">
        <div>
          <div className="eyebrow">CHOOSE YOUR KIND OF TRIP</div>
          <h2 className="serif">A plan that fits<br /><em>the people going.</em></h2>
        </div>
        <div className="section-note">
          <p>Choose a travel format to see what to include in your enquiry. Prices, dates, access, and availability are confirmed for each request—nothing here is a live booking.</p>
          <span className="mono">FIVE WAYS TO START&nbsp; / &nbsp;ONE CONVERSATION</span>
        </div>
      </div>
      <Tabs defaultValue="customized" className="travel-tabs">
        <TabsList className="travel-tab-list" aria-label="Choose a tour type">
          {tourFormats.map((format) => <TabsTrigger className="travel-tab" key={format.value} value={format.value}>{format.tab}</TabsTrigger>)}
        </TabsList>
        {tourFormats.map((format) => {
          const Icon = format.icon;
          return (
            <TabsContent className="travel-tab-content" key={format.value} value={format.value}>
              <article className="format-panel">
                <div className="format-illustration" aria-hidden="true">
                  <div className="format-orbit format-orbit-one" />
                  <div className="format-orbit format-orbit-two" style={{ backgroundImage: `linear-gradient(rgba(10, 18, 26, .36), rgba(10, 18, 26, .36)), url("${asset(format.image)}")` }} />
                  <span><Icon size={39} strokeWidth={1.25} /></span>
                  <small className="mono">{format.tab.toUpperCase()}</small>
                </div>
                <div className="format-copy">
                  <div className="eyebrow">{format.kicker}</div>
                  <h3 className="serif">{format.title}</h3>
                  <p>{format.description}</p>
                  <ul>{format.details.map((detail) => <li key={detail}><span aria-hidden="true">+</span>{detail}</li>)}</ul>
                  <button className="btn-gold" onClick={() => onEnquire(format.kind)} type="button">Plan this kind of trip <ArrowRight size={15} /></button>
                </div>
              </article>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}

export function SpecialistTravel({ onEnquire }: { onEnquire: TravelAction }) {
  return (
    <>
      <section id="spiritual-trips" className="spiritual-section section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PILGRIMAGE & SPIRITUAL TRAVEL</div>
              <h2 className="serif">Journeys with<br /><em>meaning.</em></h2>
            </div>
            <div className="section-note">
              <p>From a single shrine to a multi-stop pilgrimage, share your preferred route, dates, and pace. The final itinerary depends on access, local conditions, and travel requirements.</p>
              <span className="mono">JYOTIRLINGA&nbsp; / &nbsp;ASHTAVINAYAKA&nbsp; / &nbsp;CHAR DHAM</span>
            </div>
          </div>
          <div className="spiritual-grid">
            {spiritualRoutes.map((route) => (
              <article className="spiritual-card" key={route.title}>
                <span className="spiritual-symbol" aria-hidden="true">{route.symbol}</span>
                <div className="eyebrow">PILGRIMAGE ROUTE</div>
                <h3 className="serif">{route.title}</h3>
                <p>{route.text}</p>
                <button className="text-link" type="button" onClick={() => onEnquire('Spiritual journey')}>Ask about this route <ArrowUpRight size={14} /></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="rail-travel" className="rail-section section wrap">
        <div className="rail-panel">
          <div className="rail-art" aria-hidden="true">
            <Train size={53} strokeWidth={1.1} />
            <span className="rail-line rail-line-one" />
            <span className="rail-line rail-line-two" />
            <span className="mono">ACROSS INDIA</span>
          </div>
          <div className="rail-copy">
            <div className="eyebrow">RAIL JOURNEYS ACROSS INDIA</div>
            <h2 className="serif">A rail plan,<br /><em>from here to there.</em></h2>
            <p>Send a rail enquiry with your from/to stations, travel date, and passenger count. This website does not check live train availability or issue tickets; you can use the official IRCTC booking service for live search and ticketing.</p>
            <div className="rail-actions">
              <button className="btn-gold" type="button" onClick={() => onEnquire('Rail booking assistance')}>Ask about rail travel <ArrowRight size={15} /></button>
              <a className="official-link" href="https://www.irctc.co.in/" target="_blank" rel="noopener noreferrer">Open official IRCTC <ArrowUpRight size={14} /></a>
            </div>
            <a className="rail-contact" href={`tel:${contacts.domestic.tel}`}><MapPin size={14} /> Domestic enquiries: {contacts.domestic.display}</a>
          </div>
        </div>
      </section>

      <section id="travel-documents" className="documents-section section">
        <div className="wrap documents-layout">
          <div className="documents-heading">
            <div className="eyebrow">PASSPORT & VISA GUIDANCE</div>
            <h2 className="serif">Travel paperwork,<br /><em>talked through.</em></h2>
            <p>Already have a visa? Mention it in your enquiry. Visa-on-arrival eligibility depends on the traveller’s passport, destination, and trip. If advance visa applications are required, the team will discuss the expected timeline with you early. Visa decisions are made by the relevant authorities.</p>
            <p className="document-disclaimer"><ShieldCheck size={15} /> Entry and document rules can change. Confirm current requirements with the relevant official authorities before booking.</p>
            <button className="btn-outline" type="button" onClick={() => onEnquire('Visa assistance')}>Ask about visa assistance <ArrowRight size={14} /></button>
          </div>
          <div className="documents-contact">
            <div className="document-icon"><BookOpen size={23} strokeWidth={1.35} /></div>
            <div className="eyebrow">PASSPORT SEVA ASSISTANCE</div>
            <h3 className="serif">A hand with the process.</h3>
            <p>Ask the team about passport documentation support. Official applications and decisions remain with Passport Seva and the relevant authorities.</p>
            <a className="official-link" href="https://www.passportindia.gov.in/" target="_blank" rel="noopener noreferrer">Official Passport Seva portal <ArrowUpRight size={14} /></a>
            <a className="document-phone" href={`tel:${contacts.passport.tel}`}>{contacts.passport.display}<ArrowUpRight size={13} /></a>
            <button className="text-link" type="button" onClick={() => onEnquire('Passport assistance')}>Ask for passport help <ArrowRight size={14} /></button>
          </div>
        </div>
      </section>

      <section className="contact-options wrap" aria-label="Choose the right enquiry contact">
        <div className="contact-options-head">
          <div className="eyebrow">TALK TO THE RIGHT DESK</div>
          <p>Call directly, or send the full trip details with the enquiry form.</p>
        </div>
        <div className="contact-options-grid">
          {[contacts.international, contacts.domestic, contacts.passport, contacts.general].map((contact) => (
            <a className="contact-option" href={`tel:${contact.tel}`} key={contact.label}>
              <span>{contact.label}</span><strong>{contact.display}</strong><ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
