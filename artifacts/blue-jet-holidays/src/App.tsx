import { useEffect, useMemo, useState, type FormEvent, type CSSProperties } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Compass, MapPin, Menu, MessageCircle, Minus, Phone, Plus, Send, ShieldCheck, X } from 'lucide-react';
import { SpecialistTravel, TripFormats } from '@/components/travel-sections';
import { contacts, enquiryKinds, type EnquiryFormValues, type EnquiryKind } from '@/lib/travel';

const queryClient = new QueryClient();
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
const phone = contacts.general.display;
const email = 'bluejetholidaypune@gmail.com';
const mailDraftFor = (form: EnquiryFormValues) => {
  const subject = `Blue Jet Holidays enquiry: ${form.destination || form.kind}`.replace(/[\r\n]+/g, ' ').slice(0, 120);
  const body = [
    'Travel enquiry',
    '',
    `Enquiry type: ${form.kind}`,
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Email: ${form.email || 'Not provided'}`,
    `Destination or route: ${form.destination || 'To be discussed'}`,
    `Leaving from: ${form.departure || 'To be discussed'}`,
    `Travel month: ${form.when || 'Not decided'}`,
    `Travellers: ${form.travellers || 'To be discussed'}`,
    ...(form.institution ? [`School, college, or organisation: ${form.institution}`] : []),
    `Additional details: ${form.details || 'None provided'}`,
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
const emptyEnquiry: EnquiryFormValues = {
  kind: 'General enquiry',
  destination: '',
  departure: 'Pune / Mumbai',
  when: '',
  travellers: '2',
  name: '',
  phone: '',
  email: '',
  institution: '',
  details: '',
  website: '',
  consent: false,
};

type Destination = {
  name: string;
  image: string;
  caption?: string;
  regions?: string;
  scope: 'international' | 'domestic';
  description?: string;
  bestTime?: string;
};

const destinations: Destination[] = [
  { name: 'Thailand', image: 'bangkok-package.webp', caption: 'Bangkok after dark', scope: 'international', regions: 'Bangkok · Phuket · Chiang Mai', description: 'Build a Thailand itinerary around city time, island stays, or a mix of both. Tell us what you want from the trip and how long you have.' },
  { name: 'Dubai & Abu Dhabi', image: 'dubai-package.webp', caption: 'The Palm and the Gulf from above', scope: 'international', regions: 'Dubai · Abu Dhabi', description: 'Pair the two emirates in one trip or focus on one. Share your dates, interests, and group size for a route and quotation.' },
  { name: 'Singapore', image: 'singapore-package.webp', caption: 'Gardens and the Marina Bay waterfront', scope: 'international', regions: 'Marina Bay · Sentosa · Gardens by the Bay', description: 'A compact city break with room for food, gardens, neighbourhoods, and family-friendly stops. We can shape the pace around your group.' },
  { name: 'Malaysia', image: 'malaysia-kuala-lumpur.webp', caption: 'Kuala Lumpur at blue hour', scope: 'international', regions: 'Kuala Lumpur · Penang · Langkawi', description: 'Combine a city stay with time in another part of the country. Tell us which places interest you and we will discuss the connections and timing.' },
  { name: 'Bali', image: 'bali-package.webp', caption: 'The cliffs of southern Bali', scope: 'international', regions: 'Ubud · Seminyak · Nusa Penida', description: 'A trip can bring together Bali’s inland scenery, coastal stays, and time for local culture. The route and pace depend on your dates and preferences.' },
  { name: 'Vietnam', image: 'vietnam-package.webp', caption: 'The limestone islands of Ha Long Bay', scope: 'international', regions: 'Hanoi · Ha Long · Da Nang', description: 'Plan a route between historic city districts, the coast, and landscapes such as Ha Long Bay. Share how many stops you want to fit in.' },
  { name: 'Maldives', image: 'maldives-package.webp', caption: 'The Indian Ocean at sunset', scope: 'international', regions: 'Malé · resort islands', description: 'Choose the kind of island stay and transfer that suit your trip. Resort availability, transport, and inclusions are checked for the dates you request.' },
  { name: 'Mauritius', image: 'mauritius-lagoon.webp', caption: 'Le Morne and the lagoon coast', scope: 'international', regions: 'Port Louis · Le Morne · lagoon coast', description: 'Plan island time around the coast, local sights, and the activities your group wants to include. We confirm stays and transport in the quotation.' },
  { name: 'Sri Lanka', image: 'sri-lanka-tea-country.webp', caption: 'Rail country and tea-covered hills', scope: 'international', regions: 'Kandy · Ella · Galle', description: 'A route can connect hill-country scenery, historic sites, and the coast. Tell us the places you want to see and how you prefer to travel between them.' },
  { name: 'Kashmir', image: 'kashmir-dal-lake.webp', caption: 'Dal Lake and the Himalaya', scope: 'domestic', regions: 'Srinagar · Gulmarg · Pahalgam', description: 'Discuss a Kashmir itinerary around Srinagar, Gulmarg, Pahalgam, or the stops your group has in mind. Routes and access are confirmed close to travel.', bestTime: 'March–October' },
  { name: 'Kerala', image: 'kerala-backwaters.webp', caption: 'Palm-lined Kerala backwaters', scope: 'domestic', regions: 'Alappuzha · Munnar · Thekkady', description: 'Bring together backwater stays, hill-country scenery, and time in the places you choose. The plan can be paced for your group.', bestTime: 'September–March' },
  { name: 'Rajasthan', image: 'rajasthan-udaipur.webp', caption: 'Udaipur beside Lake Pichola', scope: 'domestic', regions: 'Jaipur · Udaipur · Jaisalmer', description: 'Plan a city-to-city route around forts, palaces, desert landscapes, or a shorter stay in one place. Share your dates and preferred pace.', bestTime: 'October–March' },
  { name: 'Ladakh', image: 'ladakh-indus-valley.webp', caption: 'The Indus valley in Ladakh', scope: 'domestic', regions: 'Leh · Nubra Valley · Pangong', description: 'A high-altitude trip needs careful pacing and current route checks. Tell us your preferred places and dates so we can discuss a practical itinerary.' },
  { name: 'Kanyakumari', image: 'kanyakumari-dawn.webp', caption: 'Sunrise on India’s southern coast', scope: 'domestic', regions: 'Kanyakumari · Thiruvalluvar Statue · Vivekananda Rock', description: 'Plan a coastal visit around Kanyakumari and nearby points of interest. We can discuss how it fits into a wider South India route.' },
  { name: 'Seven Sisters', image: 'seven-sisters-meghalaya.webp', caption: 'A green valley in Meghalaya', scope: 'domestic', regions: 'Assam · Arunachal Pradesh · Manipur · Meghalaya · Mizoram · Nagaland · Tripura', description: 'Explore a route through India’s Northeast, choosing the states and stops that suit your group. Distances, seasonal access, permits, and connections are checked for your travel dates.' },
  { name: 'Gujarat', image: 'gujarat-rann-of-kutch.webp', caption: 'The Great Rann of Kutch at golden hour', scope: 'domestic', regions: 'Kutch · Ahmedabad · Gir · Vadodara', description: 'Plan a Gujarat itinerary around the places and experiences you choose, from the Rann of Kutch to city, heritage, and wildlife stops. Seasonal access and availability are confirmed for your dates.' },
];

const heroDestinations = ['Thailand', 'Dubai', 'Singapore', 'Bali', 'Vietnam', 'Maldives', 'Somewhere else'];
const packages = [
  { destination: 'Thailand', image: 'bangkok-package.webp', length: '4N/5D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Thailand', image: 'bangkok-package.webp', length: '6N/7D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Dubai', image: 'dubai-package.webp', length: '4N/5D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Dubai & Abu Dhabi', image: 'dubai-package.webp', length: '6N/7D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Singapore', image: 'singapore-package.webp', length: '4N/5D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Maldives', image: 'maldives-package.webp', length: '4N/5D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Sri Lanka', image: 'sri-lanka-tea-country.webp', length: '4N/5D', minimum: '4 minimum', tier: 'BASIC' },
  { destination: 'Kashmir', image: 'kashmir-dal-lake.webp', length: '5N/6D', minimum: '6 minimum', tier: 'BASIC', domestic: true },
  { destination: 'Kerala', image: 'kerala-backwaters.webp', length: '5N/6D', minimum: '6 minimum', tier: 'BASIC', domestic: true },
  { destination: 'Rajasthan', image: 'rajasthan-udaipur.webp', length: '5N/6D', minimum: '6 minimum', tier: 'BASIC', domestic: true },
  { destination: 'Himachal Pradesh', image: 'himachal-package.webp', length: '5N/6D', minimum: '6 minimum', tier: 'BASIC', domestic: true },
  { destination: 'Leh Ladakh', image: 'ladakh-indus-valley.webp', length: '5N/6D', minimum: '6 minimum', tier: 'BASIC', domestic: true },
];
const heroCaptions: Record<string, string> = {
  Thailand: 'The lights of Bangkok after dark',
  Dubai: 'The Palm and the Gulf from the air',
  Singapore: 'The gardens and lake at Marina Bay',
  Bali: 'Surf against the cliffs of southern Bali',
  Vietnam: 'The limestone islands of Ha Long Bay',
  Maldives: 'The Indian Ocean at sunset',
  'Somewhere else': 'Tell us the place you have in mind',
};

const steps = [
  { no: '01', title: 'Tell us the brief', text: 'Share the destination, travel window, group size, and what matters most. A form or phone call is a good place to start.' },
  { no: '02', title: 'Review the route', text: 'The team discusses possible flights, stays, transfers, and an itinerary around your request. You can review the written quotation before deciding.' },
  { no: '03', title: 'Check the details', text: 'Travel documents, visa timing, access, and supplier conditions are discussed where they apply. Entry decisions remain with the relevant authorities.' },
  { no: '04', title: 'Keep in touch', text: 'Use the contact number for your enquiry if a booked arrangement needs attention. Support depends on the supplier and ticket conditions.' },
];

const promises = [
  { title: 'Preferences discussed', text: 'Tell us about meal preferences or accessibility needs. Specific arrangements depend on what each supplier can confirm.' },
  { title: 'Paced for the group', text: 'Share the travel pace and support needs that matter to your party so they can be considered while planning.' },
  { title: 'Inclusions in writing', text: 'Review the confirmed itinerary, inclusions, exclusions, and supplier terms before you make a booking.' },
  { title: 'A real conversation', text: 'Call the relevant desk to discuss a trip, paperwork question, or group request with the Blue Jet Holidays team.' },
];

const faqs = [
  { q: 'How far ahead should I book?', a: 'Share the dates you have in mind and we can work through the options with you. The right lead time depends on the destination, season and your group.' },
  { q: 'Can I ask for a visa before I book?', a: 'Yes. Visa assistance can be discussed early. Requirements depend on the traveller’s passport and destination; the relevant authority makes the final decision.' },
  { q: 'Can you plan a trip anywhere in the world?', a: 'Send the destination and dates you have in mind. The team will review what can be arranged and confirm the route, availability, and quotation with you.' },
  { q: 'Do you organise private, group, and student tours?', a: 'Yes. Private tour enquiries are for up to 11 travellers, group tour enquiries start at 16, and student tour enquiries can be for destinations in India or overseas.' },
  { q: 'Can I book train tickets on this website?', a: 'This website collects rail-travel enquiries and links to the official IRCTC service. It does not display live train availability, fares, or issue tickets.' },
  { q: 'Can you organise pilgrimage circuits?', a: 'You can enquire about Jyotirlinga, Ashtavinayaka, Char Dham, and Kedarnath travel. Routes and access are confirmed for your requested dates.' },
  { q: 'What if a booked arrangement changes?', a: 'Contact the team using the number for your enquiry. Any change depends on the airline, accommodation, transport provider, and the terms of your booking.' },
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Routed />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Routed() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function Home() {
  const [selected, setSelected] = useState('Thailand');
  const [departure, setDeparture] = useState('Pune / Mumbai');
  const [when, setWhen] = useState('');
  const [travellers, setTravellers] = useState('2 Adults (Couple)');
  const [modalDest, setModalDest] = useState<Destination | null>(null);
  const [enquiry, setEnquiry] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendError, setSendError] = useState('');
  const [mailFallback, setMailFallback] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState<EnquiryFormValues>(emptyEnquiry);
  const [heroOffset, setHeroOffset] = useState(0);
  const imageFor = useMemo(() => {
    if (selected === 'Somewhere else') return 'mauritius-lagoon.webp';
    const d = destinations.find((item) => item.name === selected || item.name.startsWith(selected));
    return d?.image ?? 'mauritius-lagoon.webp';
  }, [selected]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onScroll = () => setHeroOffset(Math.min(window.scrollY * 0.12, 42));
    if (!media.matches) window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = modalDest || enquiry ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalDest, enquiry]);

  const showEnquiry = (destination = selected, from = departure, date = when, count = travellers, kind: EnquiryKind = 'General enquiry') => {
    setEnquiryForm({
      ...emptyEnquiry,
      kind,
      destination,
      departure: from,
      when: date,
      travellers: /^\d+$/.test(count) ? count : count.toLowerCase().includes('couple') ? '2' : '',
    });
    setSubmitted(false);
    setSendError('');
    setMailFallback(false);
    setEnquiry(true);
  };
  const handlePlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showEnquiry(selected, departure, when, travellers, 'International holiday');
  };
  const updateEnquiry = <K extends keyof EnquiryFormValues>(key: K, value: EnquiryFormValues[K]) => {
    setEnquiryForm((current) => ({ ...current, [key]: value }));
    setSendError('');
    setMailFallback(false);
  };
  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendError('');
    setMailFallback(false);
    setSubmitting(true);
    try {
      const response = await fetch('/api/travel-enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryForm),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'The enquiry could not be delivered.');
      setSubmitted(true);
    } catch {
      setMailFallback(true);
      setSendError('The website could not confirm email delivery. Your enquiry is not marked as sent. Open the pre-filled email draft and send it from your mail app, or contact the team directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grain">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} onEnquire={() => showEnquiry()} />
      <main>
        <section className="hero" id="home" style={{ '--hero-shift': `${heroOffset}px`, '--hero-image': `url("${asset(imageFor)}")` } as CSSProperties}>
          <div className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-topline wrap"><span>TRAVEL, THOUGHT THROUGH</span><span className="hero-index">MAHARASHTRA&nbsp; / &nbsp;THE WORLD</span></div>
          <div className="hero-content wrap">
            <div className="eyebrow"><span className="eyebrow-dot" /> HOLIDAYS THAT FEEL LIKE YOURS</div>
            <h1 className="serif">The holiday they’ll still be <em>talking about</em> in ten years.</h1>
            <p className="hero-intro">Share the destination, dates, and people travelling. Blue Jet Holidays will discuss an itinerary and a trip-specific quotation with you. Choose a place below, or tell us about somewhere else.</p>
            <div className="destination-picker" aria-label="Choose a destination">
              {heroDestinations.map((destination) => <button key={destination} data-testid={`select-hero-${destination.toLowerCase()}`} className={`destination-pill ${selected === destination ? 'active' : ''}`} onClick={() => setSelected(destination)} type="button"><span className="pill-mark">{selected === destination ? '•' : '↗'}</span>{destination}</button>)}
            </div>
            <p className="caption"><span /> NOW SHOWING — {heroCaptions[selected] ?? heroCaptions[selected.split(' ')[0]]}</p>
            <form className="trip-form" onSubmit={handlePlan}>
              <label><span>WHERE TO</span><select data-testid="select-where-to" value={selected} onChange={(e) => setSelected(e.target.value)}>{heroDestinations.map((d) => <option key={d} value={d}>{d}</option>)}</select><ChevronDown size={14} /></label>
              <label><span>FLYING FROM</span><select data-testid="select-flying-from" value={departure} onChange={(e) => setDeparture(e.target.value)}><option>Pune / Mumbai</option><option>Pune</option><option>Mumbai</option></select><ChevronDown size={14} /></label>
              <label><span>ROUGHLY WHEN</span><input data-testid="input-roughly-when" type="month" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Roughly when" /></label>
              <label><span>WHO’S GOING</span><select data-testid="select-who-going" value={travellers} onChange={(e) => setTravellers(e.target.value)}><option>2 Adults (Couple)</option><option>2 Adults</option><option>Family</option><option>Group</option></select><ChevronDown size={14} /></label>
              <button className="btn-gold plan-btn" type="submit" data-testid="button-start-planning"><Send size={14} /> Start planning</button>
            </form>
            <div className="hero-bottom"><span>BUILT AROUND YOUR PEOPLE, NOT A BROCHURE.</span><a href="#destinations">Explore the places <ArrowDown size={13} /></a></div>
          </div>
        </section>

        <section className="intro-band">
          <div className="wrap intro-inner">
            <div className="intro-number mono">01 <span> / &nbsp; HOW WE PLAN</span></div>
            <p className="serif intro-quote">A good trip starts long before the airport.</p>
            <p className="intro-copy">We plan for the people going, not just the place on the map. Every detail is discussed, written down and thought through — so the only surprises are the good ones.</p>
          </div>
        </section>

        <section id="destinations" className="destinations section wrap">
          <div className="section-heading">
            <div><div className="eyebrow">WHERE WOULD YOU LIKE TO GO?</div><h2 className="serif">India, overseas,<br />or somewhere new.</h2></div>
            <div className="section-note"><p>Explore these destinations as starting points. We can also discuss other places worldwide. Prices, availability, and package details are confirmed for your dates and group—no sample price is presented as a live quote.</p><span className="mono">INDIA&nbsp; / &nbsp;INTERNATIONAL&nbsp; / &nbsp;TAILOR-MADE</span></div>
          </div>
          <Tabs defaultValue="international" className="destination-tabs">
            <TabsList className="destination-tab-list" aria-label="Choose a destination region">
              <TabsTrigger className="destination-tab" value="international">International</TabsTrigger>
              <TabsTrigger className="destination-tab" value="domestic">India</TabsTrigger>
            </TabsList>
            {(['international', 'domestic'] as const).map((scope) => {
              const regionDestinations = destinations.filter((destination) => destination.scope === scope);
              const offset = scope === 'international' ? 0 : destinations.filter((destination) => destination.scope === 'international').length;
              return (
                <TabsContent className="destination-tab-content" key={scope} value={scope}>
                  <div className="destination-grid">
                    {regionDestinations.map((destination, index) => <DestinationCard key={destination.name} item={destination} index={offset + index} onOpen={() => setModalDest(destination)} />)}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
          <div className="worldwide-note" id="destination-anywhere">
            <div><div className="eyebrow">HAVE ANOTHER DESTINATION IN MIND?</div><p className="serif">We can discuss a trip anywhere in the world.</p></div>
            <button className="btn-gold" type="button" onClick={() => showEnquiry('Somewhere else', departure, when, travellers, 'International holiday')}>Tell us where you want to go <ArrowRight size={15} /></button>
          </div>
          <section className="package-section" aria-labelledby="packages-heading">
            <div className="package-heading"><div><div className="eyebrow">A FEW WAYS A TRIP CAN TAKE SHAPE</div><h3 className="serif" id="packages-heading">Curated packages,<br /><em>for every dream.</em></h3></div><p>Starting points, not fixed prices. Dates, flights and group size shape the real quotation — ask us for one.</p></div>
            <div className="package-grid">{packages.map((item, index) => <article className="package-card" key={`${item.destination}-${item.length}`}>
              <div className="package-image"><img src={asset(item.image)} alt={`${item.destination} destination`} loading="eager" decoding="async" /><span className={`package-type ${item.domestic ? 'domestic' : ''}`}>{item.domestic ? 'DOMESTIC' : 'INTERNATIONAL'}</span></div>
              <div className="package-content"><h4 className="serif">{item.destination}</h4><div className="package-facts"><span><span className="fact-icon">▦</span>{item.length}</span><span><span className="fact-icon">♟</span>{item.minimum}</span></div><p className="package-tier">PACKAGE: <strong>{item.tier}</strong></p><button className="package-quote" onClick={() => showEnquiry(item.destination, departure, when, travellers, item.domestic ? 'Domestic holiday' : 'International holiday')} data-testid={`button-package-quote-${index + 1}`}>Get quote <ArrowUpRight size={13} /></button></div>
            </article>)}</div>
          </section>
          <div className="quote-note"><span className="quote-mark">“</span><p className="serif">No off-the-shelf prices. Just a real conversation about your trip.</p><button className="text-link" onClick={() => showEnquiry(selected, departure, when, travellers, 'General enquiry')} data-testid="button-request-quote">Tell us what you have in mind <ArrowRight size={15} /></button></div>
        </section>

        <TripFormats onEnquire={(kind) => showEnquiry(selected, departure, when, travellers, kind)} />
        <SpecialistTravel onEnquire={(kind) => showEnquiry(selected, departure, when, travellers, kind)} />

        <section id="how-we-plan" className="planning">
          <div className="wrap">
            <div className="planning-head">
              <div><div className="eyebrow">THE WAY WE WORK</div><h2 className="serif">Good planning is<br /><em>personal.</em></h2></div>
              <p>Not a booking engine. A person who knows the trip, the details, and who to call if something shifts.</p>
            </div>
            <div className="steps">
              {steps.map((step) => <article className="step" key={step.no}><div className="step-no mono">{step.no}</div><h3>{step.title}</h3><p>{step.text}</p></article>)}
            </div>
            <div className="promise-grid">
              {promises.map((promise, i) => <article className="promise" key={promise.title}><span className="promise-symbol">{['◒', '↔', '▤', '文'][i]}</span><div><h3>{promise.title}</h3><p>{promise.text}</p></div></article>)}
            </div>
          </div>
        </section>

        <section id="questions" className="questions">
          <div className="wrap question-layout">
            <div className="question-side"><div className="eyebrow">BEFORE YOU ASK</div><h2 className="serif">The things people<br />ask us first.</h2><p>For a quick question, call the general enquiries desk.</p><a className="call-inline" href={`tel:${contacts.general.tel}`}><Phone size={14} /> {phone} <ArrowUpRight size={13} /></a></div>
            <div className="faq-list">
              {faqs.map((item, index) => <div className={`faq-item ${faqOpen === index ? 'open' : ''}`} key={item.q}>
                <button className="faq-question" data-testid={`button-faq-${index + 1}`} aria-expanded={faqOpen === index} onClick={() => setFaqOpen(faqOpen === index ? null : index)}><span>{item.q}</span>{faqOpen === index ? <Minus size={16} /> : <Plus size={16} />}</button>
                <div className="faq-answer" aria-hidden={faqOpen !== index}><p>{item.a}</p></div>
              </div>)}
            </div>
          </div>
        </section>

        <section className="last-call">
          <div className="last-call-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(8,14,20,.88),rgba(8,14,20,.45)),url("${asset('mauritius-lagoon.webp')}")` }} />
          <div className="wrap last-call-inner">
            <div className="eyebrow">WHEN YOU’RE READY</div>
            <h2 className="serif">Tell us where you’re<br />dreaming of going.</h2>
            <p>Start with a place, a date, or just the people you want to take. We’ll take it from there — one conversation at a time.</p>
            <button className="btn-gold" onClick={() => showEnquiry()} data-testid="button-start-a-conversation">Start a conversation <ArrowRight size={15} /></button>
            <span className="last-call-note">NO COMMITMENT. NO PRICE GUESSING. JUST A PROPER PLAN.</span>
          </div>
        </section>
      </main>
      <Footer onEnquire={() => showEnquiry()} onDestination={(destination, scope) => showEnquiry(destination, departure, when, travellers, scope === 'domestic' ? 'Domestic holiday' : 'International holiday')} />
      {modalDest && <DestinationModal destination={modalDest} onClose={() => setModalDest(null)} onQuote={() => { const destination = modalDest.name; const kind = modalDest.scope === 'domestic' ? 'Domestic holiday' : 'International holiday'; setModalDest(null); showEnquiry(destination, departure, when, travellers, kind); }} />}
      {enquiry && <EnquiryModal form={enquiryForm} onChange={updateEnquiry} submitting={submitting} error={sendError} mailFallback={mailFallback} submitted={submitted} onSubmit={handleSend} onClose={() => setEnquiry(false)} />}
    </div>
  );
}

function Header({ menuOpen, setMenuOpen, onEnquire }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void; onEnquire: () => void }) {
  const nav = [['Destinations', '#destinations'], ['Tour formats', '#trip-formats'], ['Pilgrimages', '#spiritual-trips'], ['Rail', '#rail-travel'], ['Visa & passport', '#travel-documents'], ['FAQs', '#questions']];
  return <header className="site-header">
    <div className="header-inner wrap">
      <a href="#home" className="brand" aria-label="Blue Jet Holidays home"><img src={asset('bluejet-official-logo.png')} alt="Blue Jet Holidays — A perfect travel partner" /></a>
      <nav className={`desktop-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <div className="header-actions"><a className="header-phone" href={`tel:${contacts.general.tel}`}><Phone size={13} fill="currentColor" /> <span>{phone}</span></a><button className="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
    </div>
    {menuOpen && <div className="mobile-panel">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={14} /></a>)}<button onClick={() => { setMenuOpen(false); onEnquire(); }}>Start planning <ArrowRight size={14} /></button></div>}
  </header>;
}

function DestinationCard({ item, index, onOpen }: { item: Destination; index: number; onOpen: () => void }) {
  return <article className="destination-card" style={{ '--card-index': index } as CSSProperties}>
    <button className="card-open" type="button" onClick={onOpen} aria-label={`View ${item.name} details`} data-testid={`button-destination-${item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>
      <div className="card-image" style={{ backgroundImage: `url("${asset(item.image)}")` }}><span className="card-index mono">{String(index + 1).padStart(2, '0')}</span><span className="card-arrow"><ArrowUpRight size={16} /></span></div>
      <div className="card-body"><h3 className="serif">{item.name}</h3>{item.regions && <p className="card-regions">{item.regions}</p>}{item.description && <p className="card-copy">{item.description}</p>}{item.bestTime && <p className="best-time"><span>Best travel window:</span> {item.bestTime} · confirm for your route</p>}<span className="card-plan">Explore this place <ChevronRight size={14} /></span></div>
    </button>
  </article>;
}

function DestinationModal({ destination, onClose, onQuote }: { destination: Destination; onClose: () => void; onQuote: () => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="destination-modal" role="dialog" aria-modal="true" aria-labelledby="destination-title">
      <div className="modal-hero" style={destination.image ? { backgroundImage: `linear-gradient(0deg,rgba(6,10,16,.84),transparent 80%),url("${asset(destination.image)}")` } : undefined}>
        <button className="modal-close" onClick={onClose} aria-label="Close destination details"><X size={17} /></button>
        {destination.regions && <p className="eyebrow">{destination.regions}</p>}<h2 className="serif" id="destination-title">{destination.name}</h2>
      </div>
      <div className="modal-scroll">
        <p className="modal-description">{destination.description}</p>
        <div className="modal-label mono">PRACTICAL NOTES</div>
        <div className="practical-grid"><div><span>DESTINATION TYPE</span><strong>{destination.scope === 'domestic' ? 'India' : 'International'}</strong></div><div><span>TRAVEL WINDOW</span><strong>Discussed for your dates</strong></div><div><span>THE PLAN</span><strong>Based on your group</strong></div><div><span>QUOTE</span><strong>Prepared for your request</strong></div></div>
        <p className="modal-caution">Requirements and availability vary by trip. We confirm details with you before anything is booked.</p>
      </div>
      <div className="modal-actions"><button className="btn-gold" onClick={onQuote}>Request a quote for {destination.name.split(' ')[0]} <ArrowRight size={15} /></button><a className="btn-outline" href={`tel:${contacts.general.tel}`}><Phone size={14} /> Call {phone}</a></div>
    </section>
  </div>;
}

type EnquiryChange = <K extends keyof EnquiryFormValues>(key: K, value: EnquiryFormValues[K]) => void;

function EnquiryModal({ form, onChange, submitting, error, mailFallback, submitted, onSubmit, onClose }: {
  form: EnquiryFormValues;
  onChange: EnquiryChange;
  submitting: boolean;
  error: string;
  mailFallback: boolean;
  submitted: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const studentEnquiry = form.kind.includes('student');
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-heading">
      <div className="enquiry-head"><div><div className="eyebrow">A GOOD TRIP STARTS WITH A CONVERSATION</div><h2 className="serif" id="enquiry-heading">{submitted ? 'Enquiry sent.' : 'Let’s start with you.'}</h2></div><button className="modal-close" aria-label="Close enquiry" onClick={onClose}><X size={17} /></button></div>
      {!submitted ? <>
        <p className="enquiry-intro">Share your trip details below. Automatic website email delivery is not connected right now. If delivery is unavailable, you can review a pre-filled email draft and send it from your own mail app.</p>
        <div className="enquiry-summary"><span><small>ENQUIRY TYPE</small>{form.kind}</span><span><small>DESTINATION / ROUTE</small>{form.destination || 'To be discussed'}</span><span><small>FROM</small>{form.departure || 'To be discussed'}</span><span><small>WHEN</small>{form.when || 'Not decided'}</span><span><small>TRAVELLERS</small>{form.travellers || 'To be discussed'}</span></div>
        <form className="enquiry-form" onSubmit={onSubmit}>
          <label>What kind of trip?
            <select value={form.kind} onChange={(e) => onChange('kind', e.target.value as EnquiryKind)}>{enquiryKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select>
          </label>
          <label>Your name<input data-testid="input-enquiry-name" maxLength={100} autoComplete="name" value={form.name} onChange={(e) => onChange('name', e.target.value)} required placeholder="How should we address you?" /></label>
          <label>Phone number<input data-testid="input-enquiry-phone" maxLength={40} autoComplete="tel" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} required type="tel" placeholder="+91" /></label>
          <label className="email-field">Email address <span>optional</span><input data-testid="input-enquiry-email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} type="email" placeholder="you@example.com" /></label>
          <label>Destination or rail route<input maxLength={120} value={form.destination} onChange={(e) => onChange('destination', e.target.value)} placeholder="Place name or from → to" /></label>
          <label>Leaving from<input maxLength={100} value={form.departure} onChange={(e) => onChange('departure', e.target.value)} placeholder="City or station" /></label>
          <label>Travel month<input type="month" value={form.when} onChange={(e) => onChange('when', e.target.value)} /></label>
          <label>Number of travellers<input type="number" min="1" max="500" value={form.travellers} onChange={(e) => onChange('travellers', e.target.value)} placeholder="For a group, enter an estimate" /></label>
          {studentEnquiry && <label className="full-field">School, college, or organisation <span>optional</span><input maxLength={120} value={form.institution} onChange={(e) => onChange('institution', e.target.value)} placeholder="Organisation name" /></label>}
          <label className="full-field">What should we know? <span>optional</span><textarea maxLength={2000} rows={4} value={form.details} onChange={(e) => onChange('details', e.target.value)} placeholder="Interests, route ideas, timing, or questions" /></label>
          <label className="website-trap" aria-hidden="true">Leave this field blank<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => onChange('website', e.target.value)} /></label>
          <label className="consent-check"><input type="checkbox" checked={form.consent} onChange={(e) => onChange('consent', e.target.checked)} required /><span>I agree to share these details with Blue Jet Holidays so the team can respond to this travel enquiry.</span></label>
          <p className="privacy-note"><ShieldCheck size={14} /> Enquiries are not stored in this website’s database. Automatic website email delivery is not connected right now; if delivery fails, the form offers a pre-filled draft for you to send. Don’t include passport numbers, payment details, student names, or sensitive information.</p>
          {error && <div className="enquiry-error" role="alert"><p>{error}</p>{mailFallback && <a className="btn-outline mail-draft-link" href={mailDraftFor(form)}><Send size={14} /> Open pre-filled email draft</a>}<p>You can also call <a href={`tel:${contacts.general.tel}`}>{contacts.general.display}</a> or email <a href={`mailto:${email}`}>{email}</a>.</p></div>}
          <button className="btn-gold submit-enquiry" type="submit" disabled={submitting} data-testid="button-send-enquiry">{submitting ? 'Sending…' : 'Send my enquiry'} <ArrowRight size={15} /></button>
        </form>
      </> : <div className="success-pane"><div className="success-icon"><Check size={20} /></div><p>Your trip enquiry has been sent to the Blue Jet Holidays team at {email}. They can reply using the contact details you provided.</p><a className="call-inline" href={`tel:${contacts.general.tel}`}><Phone size={14} /> General enquiries: {phone}</a></div>}
      <div className="modal-footer-note">NO BOOKING, PRICE OR AVAILABILITY IS CONFIRMED UNTIL THE TEAM CONFIRMS IT WITH YOU.</div>
    </section>
  </div>;
}

function Footer({ onEnquire, onDestination }: { onEnquire: (kind?: EnquiryKind) => void; onDestination: (destination: string, scope: Destination['scope']) => void }) {
  const services: { label: string; kind: EnquiryKind }[] = [
    { label: 'Customized tours', kind: 'Customized tour' },
    { label: 'Group tours · 16+', kind: 'Group tour (16+ travellers)' },
    { label: 'Private tours · up to 11', kind: 'Private tour (up to 11 travellers)' },
    { label: 'International student tours', kind: 'International student study tour' },
    { label: 'Domestic student tours', kind: 'Domestic student study tour' },
    { label: 'Spiritual journeys', kind: 'Spiritual journey' },
    { label: 'Rail assistance', kind: 'Rail booking assistance' },
    { label: 'Visa & passport help', kind: 'Visa assistance' },
  ];
  return <footer className="footer">
    <div className="wrap">
      <div className="footer-top">
        <div className="footer-brand"><a href="#home"><img src={asset('bluejet-official-logo.png')} alt="Blue Jet Holidays — A perfect travel partner" /></a><p>Trip planning across India and worldwide: customized, private, group, student, and spiritual journeys, plus rail, visa, and passport enquiries.</p><p className="footer-address"><MapPin size={14} /> 29/30 Mahada Colony, Tal. Palus, Dist. Sangli, Maharashtra 416310</p><p className="footer-address"><span className="hub-icon">▣</span> Operations hub: Swargate, Pune, Maharashtra</p></div>
        <div className="footer-column"><h3>DESTINATIONS</h3><div className="footer-links">{destinations.map((destination) => <button key={destination.name} onClick={() => onDestination(destination.name, destination.scope)}>{destination.name}</button>)}<button onClick={() => onDestination('Somewhere else worldwide', 'international')}>Somewhere else worldwide</button></div></div>
        <div className="footer-column"><h3>WAYS TO TRAVEL</h3><div className="footer-links">{services.map(({ label, kind }) => <button key={label} onClick={() => onEnquire(kind)}>{label}</button>)}</div></div>
        <div className="footer-contact"><h3>CONTACT DETAILS</h3><strong className="footer-contact-name">Pravin P. Upadhaye</strong><div className="footer-phone-grid">{[contacts.international, contacts.passport, contacts.general, contacts.domestic].map((contact) => <a key={contact.label} href={`tel:${contact.tel}`}><span>{contact.label}</span><strong>{contact.display}</strong></a>)}</div><a className="footer-email" href={`mailto:${email}`}>{email}</a><a className="whatsapp-link" href="https://wa.me/917673010608" target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp us <ArrowUpRight size={12} /></a></div>
      </div>
      <div className="footer-privacy"><div className="eyebrow">HOW THIS ENQUIRY FORM WORKS</div><p>Enquiry details are not saved in this website’s database. Automatic website email delivery is not connected right now; if delivery is unavailable, the form offers a pre-filled email draft for you to review and send yourself. Please do not include passport numbers, payment details, or student-identifying information. Any later sharing of details depends on bookings you approve and the suppliers involved. This site does not use advertising cookies.</p></div>
      <div className="footer-bottom"><span>© 2026 Blue Jet Holidays. A perfect travel partner.</span><span>Sangli · Pune · Maharashtra, India</span><span>Travel arrangements are subject to availability and supplier conditions.</span></div>
    </div>
  </footer>;
}

export default App;
