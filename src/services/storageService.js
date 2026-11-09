// =============================================================================
// STORAGE SERVICE (localStorage Manager)
// Student-friendly storage service managing packages, bookings, wishlist, 
// and agency operations without needing an external database.
// =============================================================================

// Default seed data for initial load and presentation reset
const DEFAULT_PACKAGES = [
  {
    id: 'pkg-1',
    title: 'Santorini Sunset & Aegean Island Escape',
    destination: 'Santorini',
    country: 'Greece',
    continent: 'Europe',
    category: 'Beach & Island',
    price: 1899,
    originalPrice: 2199,
    duration: 7,
    groupSize: '12 Travelers Max',
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    deal: true,
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Witness legendary pink sunsets over caldera cliffs, explore whitewashed villages, and sail private catamarans on the Aegean Sea.',
    fullDescription: 'Immerse yourself in Greek island magic. From wine tastings overlooking the volcanic caldera in Oia to swimming in the crystalline waters of the Red Beach, this 7-day curated escape balances luxury with authentic Cycladic culture.',
    included: [
      '6 nights in 4-star boutique cliffside hotel',
      'Daily Mediterranean breakfast & 3 gourmet dinners',
      'Private sunset catamaran sailing with open bar',
      'Volcanic winery tour & local cheese tasting',
      'All local airport/ferry transfers in air-conditioned van'
    ],
    notIncluded: [
      'International flights to Athens/Santorini',
      'Travel insurance (available as add-on)',
      'Personal shopping & discretionary tips'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Fira & Welcome Dinner', description: 'Arrive at Santorini Airport. Private transfer to your cliffside boutique hotel. Meet your tour guide and fellow travelers for an evening Greek mezze feast.' },
      { day: 2, title: 'Oia Village Walking Tour & Caldera Hike', description: 'Morning guided stroll through the postcard-perfect streets of Oia. Afternoon scenic hike along the caldera rim with panoramic ocean vistas.' },
      { day: 3, title: 'Volcanic Wine Tasting Tour', description: 'Discover Santorini’s centuries-old basket-vine viticulture. Visit three award-winning estate wineries with sommelier pairings.' },
      { day: 4, title: 'Private Catamaran Sunset Cruise', description: 'Sail to the volcanic Hot Springs, Red Beach, and White Beach. Savor freshly prepared BBQ seafood on deck while watching the world-famous sunset.' },
      { day: 5, title: 'Akrotiri Archaeological Site & Red Beach', description: 'Step into prehistoric history at the preserved Minoan Bronze Age ruins of Akrotiri, followed by relaxing beach time.' },
      { day: 6, title: 'Leisure Day & Traditional Cooking Class', description: 'Free morning for boutique shopping. In the afternoon, learn to cook authentic Greek tomato fritters and moussaka with a local chef.' },
      { day: 7, title: 'Farewell Aegean Breakfast & Departure', description: 'Enjoy your final sunrise breakfast overlooking the sparkling Aegean before your transfer to the airport.' }
    ],
    departureDates: ['2026-06-15', '2026-07-10', '2026-08-05', '2026-09-12']
  },
  {
    id: 'pkg-2',
    title: 'Kyoto Ancient Temples & Cultural Odyssey',
    destination: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    category: 'Cultural',
    price: 2450,
    originalPrice: 2750,
    duration: 9,
    groupSize: '10 Travelers Max',
    rating: 5.0,
    reviewCount: 42,
    featured: true,
    deal: false,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Step through thousand vermillion torii gates, participate in traditional matcha ceremonies, and stay in authentic ryokans.',
    fullDescription: 'Discover the peaceful heart of historic Japan. Wander through bamboo groves, marvel at gold-leaf shrines, savor seasonal multi-course kaiseki meals, and experience peaceful Zen meditation under ancient cedar trees.',
    included: [
      '8 nights accommodations including 2 nights in a luxury Onsen Ryokan',
      '7-day Japan Rail Pass for Shinkansen bullet trains',
      'Private authentic tea ceremony masterclass',
      'Daily breakfast and 4 traditional kaiseki banquets',
      'Expert English-speaking Japanese cultural guide'
    ],
    notIncluded: [
      'International flights to Osaka Kansai or Tokyo',
      'Kimono rental (optional)',
      'Personal incidental expenses'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Kyoto & Gion Evening Stroll', description: 'Check-in to historic district hotel. Take a peaceful twilight walk through Gion’s lantern-lit geisha quarter.' },
      { day: 2, title: 'Fushimi Inari Shrine & Tofuku-ji', description: 'Early morning climb through the iconic thousand vermilion torii gates followed by Zen rock garden contemplation.' },
      { day: 3, title: 'Kinkaku-ji (Golden Pavilion) & Ryoan-ji', description: 'Marvel at the glistening Golden Pavilion mirrored in its pond and decipher the mystery of the 15-stone Zen garden.' },
      { day: 4, title: 'Arashiyama Bamboo Grove & Monkey Park', description: 'Wander the towering Arashiyama bamboo forest and visit the historic Tenryu-ji mountain temple.' },
      { day: 5, title: 'Traditional Tea Ceremony & Nishiki Market', description: 'Hands-on tea ceremony with a Grandmaster, followed by street food exploration through Kyoto’s culinary kitchen.' },
      { day: 6, title: 'Scenic Bullet Train to Nara Deer Park', description: 'Day trip to Nara to bow to friendly wild deer and stand before the colossal bronze Great Buddha at Todai-ji.' },
      { day: 7, title: 'Transfer to Mountain Onsen Ryokan', description: 'Check into a traditional hot spring inn. Relax in natural thermal waters and indulge in multi-course kaiseki.' },
      { day: 8, title: 'Zen Meditation & Philosopher’s Path', description: 'Practice guided Zazen meditation with a Buddhist monk, followed by a quiet walk along the Philosopher’s Path.' },
      { day: 9, title: 'Sayonara Breakfast & Return Transfer', description: 'Enjoy a peaceful morning tea ceremony before departure to the train station.' }
    ],
    departureDates: ['2026-05-20', '2026-06-18', '2026-10-10', '2026-11-05']
  },
  {
    id: 'pkg-3',
    title: 'Swiss Alps & Matterhorn Glacier Expedition',
    destination: 'Zermatt & Interlaken',
    country: 'Switzerland',
    continent: 'Europe',
    category: 'Adventure & Nature',
    price: 2890,
    originalPrice: 3200,
    duration: 8,
    groupSize: '8 Travelers Max',
    rating: 4.8,
    reviewCount: 29,
    featured: true,
    deal: true,
    coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Ride the Glacier Express, gaze upon the towering Matterhorn, and trek across pristine alpine meadows and emerald lakes.',
    fullDescription: 'Breathe in pure mountain air amidst Europe’s most awe-inspiring peaks. From the car-free village of Zermatt to the towering Jungfrau glacier pass, this expedition includes scenic panoramic train journeys and Swiss alpine cuisine.',
    included: [
      '7 nights in cozy 4-star Swiss alpine chalets & hotels',
      'Swiss Travel Pass First Class (unlimited trains & lake steamers)',
      'Gornergrat Cogwheel Train ticket with Matterhorn view',
      'Jungfraujoch "Top of Europe" high-altitude excursion',
      'Traditional Swiss cheese fondue & raclette dinner'
    ],
    notIncluded: [
      'Ski or snow equipment rental',
      'Personal mountain hiking gear',
      'Optional tandem paragliding flight'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Zurich & Scenic Train to Lucerne', description: 'Board the panoramic train along Lake Lucerne. Stroll across the medieval wooden Chapel Bridge.' },
      { day: 2, title: 'Mount Pilatus Golden Roundtrip', description: 'Ascend Mt. Pilatus on the world’s steepest cogwheel railway, then descend by aerial cableway.' },
      { day: 3, title: 'Transfer to Interlaken & Lauterbrunnen Waterfalls', description: 'Journey to the valley of 72 waterfalls. Walk behind Staubbach Falls in fairy-tale Lauterbrunnen.' },
      { day: 4, title: 'Jungfraujoch Top of Europe', description: 'Ride the state-of-the-art Eiger Express cable car to the highest railway station in Europe at 3,454m.' },
      { day: 5, title: 'Glacier Express Scenic Rail to Zermatt', description: 'Experience the world’s slowest express train crossing deep gorges and snowy alpine passes.' },
      { day: 6, title: 'Matterhorn Views from Gornergrat', description: 'Take the cogwheel railway up to 3,089m for breathtaking vistas of 29 peaks exceeding 4,000 meters.' },
      { day: 7, title: 'Five Lakes Alpine Hike & Fondue Evening', description: 'Hike past alpine lakes reflecting the Matterhorn, followed by a farewell Swiss cheese fondue feast.' },
      { day: 8, title: 'Zermatt Departure to Zurich Airport', description: 'Scenic return train transfer to Zurich for outbound flights.' }
    ],
    departureDates: ['2026-07-01', '2026-07-22', '2026-08-15', '2026-09-02']
  },
  {
    id: 'pkg-4',
    title: 'Serengeti Big Five Safari & Ngorongoro Crater',
    destination: 'Serengeti National Park',
    country: 'Tanzania',
    continent: 'Africa',
    category: 'Safari & Wildlife',
    price: 3200,
    originalPrice: 3500,
    duration: 6,
    groupSize: '6 Travelers Max (4x4 Land Cruiser)',
    rating: 4.9,
    reviewCount: 34,
    featured: false,
    deal: false,
    coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Witness the Great Migration, track majestic lions and leopards, and camp in luxury tented lodges under African stars.',
    fullDescription: 'An unforgettable African adventure across endless savannahs. Led by professional Maasai trackers, you will descend into the geological wonder of Ngorongoro Crater and track herds of elephants, rhinos, and prides of lions.',
    included: [
      '5 nights in luxury eco-friendly tented safari lodges',
      'Full-board gourmet meals & safari picnic lunches',
      'Guaranteed window seat in custom 4x4 pop-top Land Cruiser',
      'All Tanzania National Park & Crater conservation fees',
      'Professional certified wildlife guide and Maasai tracker'
    ],
    notIncluded: [
      'Hot air balloon safari over Serengeti (optional add-on)',
      'Tanzania tourist visa',
      'Gratuities for driver guide and lodge staff'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Arusha & Safari Briefing', description: 'Transfer to Arusha Coffee Lodge. Meet your lead naturalist guide for an orientation on tracking the Big Five.' },
      { day: 2, title: 'Tarangire National Park (Elephant Haven)', description: 'Game drive through giant baobab landscapes renowned for massive elephant herds and tree-climbing lions.' },
      { day: 3, title: 'The Great Serengeti Plains', description: 'Drive into the boundless Serengeti. Afternoon game drive tracking leopards resting in acacia branches.' },
      { day: 4, title: 'Full Day Serengeti Migration Safari', description: 'Sunrise safari watching predator-prey dynamics, tracking cheetahs on hunt across golden grasslands.' },
      { day: 5, title: 'Ngorongoro Crater Conservation Area', description: 'Descend 600 meters into the volcanic caldera floor, home to over 25,000 large mammals and rare black rhinos.' },
      { day: 6, title: 'Maasai Cultural Village & Departure to Kilimanjaro', description: 'Learn traditional singing and survival techniques with Maasai elders before departure transfer.' }
    ],
    departureDates: ['2026-06-10', '2026-07-15', '2026-08-20', '2026-09-25']
  },
  {
    id: 'pkg-5',
    title: 'Bali Tropical Wellness & Secret Waterfalls',
    destination: 'Ubud & Uluwatu',
    country: 'Indonesia',
    continent: 'Asia',
    category: 'Beach & Island',
    price: 1350,
    originalPrice: 1600,
    duration: 8,
    groupSize: '12 Travelers Max',
    rating: 4.8,
    reviewCount: 45,
    featured: true,
    deal: true,
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Recharge your spirit with jungle yoga, emerald rice terrace walks, sacred water cleansing, and cliffside sunsets in Uluwatu.',
    fullDescription: 'Discover the Island of the Gods. This immersive journey blends wellness and outdoor wonders: sunrise volcano hikes, traditional Balinese sound healing, swimming in hidden jungle waterfalls, and surfing or relaxing on limestone cliffs.',
    included: [
      '7 nights in serene boutique jungle villas with private plunge pool',
      'Daily organic tropical breakfast and healthy smoothie bowls',
      'Sacred water blessing ceremony at Tirta Empul Temple',
      'Morning yoga and sound bath meditation sessions',
      'Private air-conditioned chauffeur for all excursions'
    ],
    notIncluded: [
      'Flight tickets to Denpasar (DPS)',
      'Spa treatments outside included sessions',
      'Scooter rental'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Bali & Ubud Jungle Check-in', description: 'Arrive at Denpasar Airport. Scenic drive to your peaceful villa nestled in Ubud’s lush river valley.' },
      { day: 2, title: 'Tegalalang Rice Terraces & Jungle Swing', description: 'Stroll through the iconic tiered emerald rice paddies and experience the exhilarating jungle swing.' },
      { day: 3, title: 'Sacred Water Temple Blessing & Sound Healing', description: 'Participate in a centuries-old purification ritual at Tirta Empul temple, followed by Tibetan bowl meditation.' },
      { day: 4, title: 'Hidden Canyon & Tegenungan Waterfall Trek', description: 'Hike through tropical rainforest to swim under cascading jungle waterfalls.' },
      { day: 5, title: 'Mount Batur Sunrise Volcano Trek', description: 'Early morning hike up Mt. Batur to watch the sun rise above clouds with breakfast cooked over steam vents.' },
      { day: 6, title: 'Transfer to Uluwatu Coastal Cliffs', description: 'Travel south to Uluwatu’s dramatic coastline. Relax on pristine white-sand Padang Padang beach.' },
      { day: 7, title: 'Uluwatu Sunset Temple & Fire Dance', description: 'Perched 70 meters above crashing surf, watch the hypnotic Kecak fire dance performance at dusk.' },
      { day: 8, title: 'Tropical Farewell & Airport Transfer', description: 'Final beachside coconut brunch before your transfer to Denpasar International Airport.' }
    ],
    departureDates: ['2026-05-10', '2026-06-05', '2026-07-12', '2026-09-08']
  },
  {
    id: 'pkg-6',
    title: 'Amalfi Coast & Positano Dolce Vita',
    destination: 'Amalfi & Capri',
    country: 'Italy',
    continent: 'Europe',
    category: 'Luxury Escapes',
    price: 2690,
    originalPrice: 2990,
    duration: 7,
    groupSize: '10 Travelers Max',
    rating: 4.9,
    reviewCount: 31,
    featured: false,
    deal: false,
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Cruise private speedboats along pastel cliffside villages, explore the Isle of Capri, and taste fresh handmade limoncello.',
    fullDescription: 'Indulge in the true Italian Dolce Vita. Experience winding coastal roads, cliffside Michelin-rated dining, private boat cruises to the Blue Grotto of Capri, and relaxing in glamorous seaside lidos.',
    included: [
      '6 nights in historic sea-view boutique hotel',
      'Private Gozzo boat excursion around Capri & Blue Grotto',
      'Lemon grove tour with homemade limoncello masterclass',
      'Daily Italian breakfast & 3 sunset dinners with local wines',
      'Private Mercedes transfers along the Amalfi Drive'
    ],
    notIncluded: [
      'Naples or Rome flights',
      'Capri funicular or taxi fares during free time',
      'City tourist taxes'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Naples & Drive to Amalfi', description: 'Scenic drive along the cliffside road to your seaside retreat. Welcome prosecco reception overlooking the Tyrrhenian Sea.' },
      { day: 2, title: 'Positano Pastel Village Walking Tour', description: 'Explore Positano’s stepped alleyways, artisan linen boutiques, and relax at Spiaggia Grande.' },
      { day: 3, title: 'Private Boat Day to Isle of Capri', description: 'Cruise around Faraglioni rock formations, swim in emerald grottos, and explore Anacapri villas.' },
      { day: 4, title: 'Ravello Cliff Gardens (Villa Rufolo & Cimbrone)', description: 'Visit Ravello high above the coast, famous for the breathtaking Terrace of Infinity.' },
      { day: 5, title: 'Lemon Grove Walk & Pizza Making Workshop', description: 'Pick fresh Amalfi lemons, sample homemade limoncello, and bake wood-fired Neapolitan pizza.' },
      { day: 6, title: 'Path of the Gods (Sentiero degli Dei) Hike', description: 'Gentle panoramic trek along historic mountain paths offering staggering coastal views.' },
      { day: 7, title: 'Arrivederci Breakfast & Naples Transfer', description: 'Savor fresh espresso and pastries before your return transfer to Naples airport or train station.' }
    ],
    departureDates: ['2026-06-01', '2026-06-25', '2026-09-05', '2026-09-20']
  },
  {
    id: 'pkg-7',
    title: 'Iceland Aurora Borealis & Ice Caves',
    destination: 'Reykjavik & Golden Circle',
    country: 'Iceland',
    continent: 'Europe',
    category: 'Adventure & Nature',
    price: 2150,
    originalPrice: 2400,
    duration: 6,
    groupSize: '12 Travelers Max',
    rating: 4.9,
    reviewCount: 27,
    featured: true,
    deal: false,
    coverImage: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Hunt dancing Northern Lights, explore shimmering sapphire ice caves beneath glaciers, and soak in geothermal hot springs.',
    fullDescription: 'Experience the land of fire and ice in its most dramatic season. Walk behind roaring waterfalls, traverse black-sand beaches with ice diamonds, step inside natural crystal-blue ice caves, and unwind in the geothermal Blue Lagoon.',
    included: [
      '5 nights in design hotels and countryside Aurora lodges',
      'Super Jeep 4x4 guided Northern Lights hunting expeditions',
      'Vatnajökull sapphire crystal ice cave entry & crampon gear',
      'Comfort ticket to Blue Lagoon with silica mud mask & drink',
      'All Golden Circle national park entrance fees'
    ],
    notIncluded: [
      'International flights to Keflavik (KEF)',
      'Thermal winter clothing rental (boots, parkas available)',
      'Lunches and alcoholic drinks'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Reykjavik & Northern Lights Hunt', description: 'Arrive at Keflavik. Evening drive into dark countryside to spot the ethereal green Aurora Borealis.' },
      { day: 2, title: 'The Golden Circle (Thingvellir, Geysir, Gullfoss)', description: 'Walk between tectonic plates at Thingvellir, watch Strokkur geysir erupt, and admire Gullfoss golden falls.' },
      { day: 3, title: 'South Coast Waterfalls & Reynisfjara Black Beach', description: 'Walk behind Seljalandsfoss waterfall and marvel at roaring basalt sea stacks at Reynisfjara.' },
      { day: 4, title: 'Sapphire Crystal Ice Cave & Diamond Beach', description: 'Equip with helmets and crampons to step into a glacial blue ice cave beneath Vatnajökull.' },
      { day: 5, title: 'Jökulsárlón Glacier Lagoon & Blue Lagoon Soak', description: 'Watch icebergs drift to the ocean, then relax in the healing waters of the mineral-rich Blue Lagoon.' },
      { day: 6, title: 'Reykjavik Architecture Stroll & Airport Farewell', description: 'Morning tour of Hallgrimskirkja and Harpa Concert Hall before departing to Keflavik Airport.' }
    ],
    departureDates: ['2026-10-15', '2026-11-10', '2026-12-05', '2026-02-14']
  },
  {
    id: 'pkg-8',
    title: 'Machu Picchu & Sacred Valley Inca Trail',
    destination: 'Cusco & Machu Picchu',
    country: 'Peru',
    continent: 'Americas',
    category: 'Cultural',
    price: 1980,
    originalPrice: 2250,
    duration: 7,
    groupSize: '10 Travelers Max',
    rating: 5.0,
    reviewCount: 36,
    featured: false,
    deal: true,
    coverImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Uncover the mysteries of the Lost City of the Incas, ride the Vistadome train through Andean cloud forests, and explore Cusco.',
    fullDescription: 'Traverse the ancient empire of the Sun. From the cobbled stone alleys of Cusco to the agricultural terraces of Moray and the breathtaking mountaintop citadel of Machu Picchu, this journey reveals one of humanity’s greatest wonders.',
    included: [
      '6 nights in charming colonial boutique hotels',
      'Vistadome 360-degree glass ceiling panoramic train ride',
      'Official Machu Picchu entrance permit with private historian',
      'Sacred Valley weaving demonstration and market excursion',
      'Daily breakfast and 3 traditional Andean lunches'
    ],
    notIncluded: [
      'Lima to Cusco domestic flights',
      'Huayna Picchu mountain summit climb permit (optional)',
      'Personal trekking gear and tips'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Imperial Cusco & Acclimatization', description: 'Arrive in historic Cusco (3,400m). Relax with soothing coca tea and take a gentle stroll around the Plaza de Armas.' },
      { day: 2, title: 'Cusco City Tour & Sacsayhuamán Fortress', description: 'Explore the Sun Temple (Qorikancha) and marvel at the colossal zig-zag megaliths of Sacsayhuamán.' },
      { day: 3, title: 'Pisac Artisan Market & Inca Terraces', description: 'Visit Pisac village market for hand-woven alpaca textiles, then explore the cliffside agricultural ruins.' },
      { day: 4, title: 'Ollantaytambo Living Inca Town', description: 'Walk through original Inca stone street grids and climb the monumental Sun Temple terraces.' },
      { day: 5, title: 'Scenic Vistadome Train & Machu Picchu Sanctuary', description: 'Ride the train through the Urubamba canyon to Aguas Calientes. Afternoon tour of the majestic citadel.' },
      { day: 6, title: 'Sunrise Over Machu Picchu & Return to Cusco', description: 'Catch early morning mist lifting over Huayna Picchu before scenic return train journey to Cusco.' },
      { day: 7, title: 'Farewell Andean Breakfast & Departure', description: 'Transfer to Alejandro Velasco Astete International Airport for your connection home.' }
    ],
    departureDates: ['2026-06-08', '2026-07-14', '2026-08-18', '2026-09-22']
  }
]

// Default seed bookings for live demonstration and testing
const DEFAULT_BOOKINGS = [
  {
    id: 'bkg-101',
    bookingRef: 'TRV-2026-4819',
    packageId: 'pkg-1',
    packageTitle: 'Santorini Sunset & Aegean Island Escape',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '+1 (555) 382-9102',
    travelDate: '2026-07-10',
    adults: 2,
    children: 0,
    roomTier: 'Deluxe Suite (+ $300)',
    addOns: ['Airport Chauffeur ($50)', 'Comprehensive Travel Insurance ($120)'],
    basePrice: 1899,
    totalPrice: 4268,
    discountAmount: 0,
    paymentMethod: 'Credit Card (•••• 4242)',
    bookingDate: '2026-04-12',
    status: 'Confirmed',
    specialRequests: 'Celebrating 5th wedding anniversary. Ocean view room requested.'
  },
  {
    id: 'bkg-102',
    bookingRef: 'TRV-2026-8924',
    packageId: 'pkg-2',
    packageTitle: 'Kyoto Ancient Temples & Cultural Odyssey',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@example.org',
    customerPhone: '+44 20 7946 0912',
    travelDate: '2026-06-18',
    adults: 1,
    children: 0,
    roomTier: 'Standard',
    addOns: ['Private Guided Tours ($250)'],
    basePrice: 2450,
    totalPrice: 2700,
    discountAmount: 0,
    paymentMethod: 'PayPal',
    bookingDate: '2026-04-18',
    status: 'Confirmed',
    specialRequests: 'Vegetarian meals preferred during ryokan kaiseki dinners.'
  },
  {
    id: 'bkg-103',
    bookingRef: 'TRV-2026-1530',
    packageId: 'pkg-4',
    packageTitle: 'Serengeti Big Five Safari & Ngorongoro Crater',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    customerPhone: '+49 30 1234567',
    travelDate: '2026-08-20',
    adults: 2,
    children: 1,
    roomTier: 'Deluxe Suite (+ $300)',
    addOns: ['Comprehensive Travel Insurance ($120)'],
    basePrice: 3200,
    totalPrice: 8320,
    discountAmount: 0,
    paymentMethod: 'Credit Card (•••• 5521)',
    bookingDate: '2026-04-20',
    status: 'Pending',
    specialRequests: 'Bringing a 10-year-old child; requested family-friendly game drive group.'
  }
]

// Default active promo codes
const PROMO_CODES = [
  { code: 'SUMMER2026', type: 'percent', value: 15, description: '15% Off Summer Escapes' },
  { code: 'WELCOME10', type: 'percent', value: 10, description: '10% Welcome Discount for New Travelers' },
  { code: 'EXPLORE50', type: 'fixed', value: 50, description: '$50 Instant Credit' }
]

// Keys used in browser localStorage
const KEYS = {
  PACKAGES: 'wanderlust_packages',
  BOOKINGS: 'wanderlust_bookings',
  WISHLIST: 'wanderlust_wishlist',
  REVIEWS: 'wanderlust_reviews'
}

// Initialize localStorage with seeds if empty
export function initStorage() {
  if (!localStorage.getItem(KEYS.PACKAGES)) {
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES))
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS))
  }
  if (!localStorage.getItem(KEYS.WISHLIST)) {
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(['pkg-1', 'pkg-2']))
  }
}

// -----------------------------------------------------------------------------
// PACKAGES API
// -----------------------------------------------------------------------------

export function getPackages() {
  initStorage()
  try {
    return JSON.parse(localStorage.getItem(KEYS.PACKAGES)) || []
  } catch (e) {
    console.error('Error reading packages from localStorage', e)
    return DEFAULT_PACKAGES
  }
}

export function getPackageById(id) {
  const packages = getPackages()
  return packages.find(pkg => pkg.id === id) || null
}

export function savePackage(packageData) {
  const packages = getPackages()
  if (packageData.id) {
    // Update existing package
    const index = packages.findIndex(p => p.id === packageData.id)
    if (index !== -1) {
      packages[index] = { ...packages[index], ...packageData }
    } else {
      packages.push(packageData)
    }
  } else {
    // Create new package with unique ID
    const newPackage = {
      ...packageData,
      id: 'pkg-' + Date.now(),
      rating: 5.0,
      reviewCount: 0
    }
    packages.unshift(newPackage)
  }
  localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages))
  return true
}

export function deletePackage(id) {
  let packages = getPackages()
  packages = packages.filter(p => p.id !== id)
  localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages))
  return true
}

// -----------------------------------------------------------------------------
// BOOKINGS API
// -----------------------------------------------------------------------------

export function getBookings() {
  initStorage()
  try {
    return JSON.parse(localStorage.getItem(KEYS.BOOKINGS)) || []
  } catch (e) {
    console.error('Error reading bookings from localStorage', e)
    return DEFAULT_BOOKINGS
  }
}

export function getBookingById(id) {
  const bookings = getBookings()
  return bookings.find(b => b.id === id) || null
}

export function createBooking(data) {
  const bookings = getBookings()
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const newBooking = {
    ...data,
    id: 'bkg-' + Date.now(),
    bookingRef: `TRV-2026-${randomNum}`,
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'Confirmed'
  }
  bookings.unshift(newBooking)
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings))
  return newBooking
}

export function updateBooking(id, updates) {
  const bookings = getBookings()
  const index = bookings.findIndex(b => b.id === id)
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates }
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings))
    return bookings[index]
  }
  return null
}

export function cancelBooking(id) {
  return updateBooking(id, { status: 'Cancelled' })
}

// -----------------------------------------------------------------------------
// WISHLIST API
// -----------------------------------------------------------------------------

export function getWishlist() {
  initStorage()
  try {
    return JSON.parse(localStorage.getItem(KEYS.WISHLIST)) || []
  } catch (e) {
    return []
  }
}

export function isWishlisted(packageId) {
  const list = getWishlist()
  return list.includes(packageId)
}

export function toggleWishlist(packageId) {
  let list = getWishlist()
  if (list.includes(packageId)) {
    list = list.filter(id => id !== packageId)
  } else {
    list.push(packageId)
  }
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify(list))
  return list
}

// -----------------------------------------------------------------------------
// PROMO CODES
// -----------------------------------------------------------------------------

export function validatePromoCode(code) {
  if (!code) return null
  const cleaned = code.trim().toUpperCase()
  return PROMO_CODES.find(p => p.code === cleaned) || null
}

// -----------------------------------------------------------------------------
// REVIEWS API
// -----------------------------------------------------------------------------

export function addReview(packageId, reviewData) {
  const packages = getPackages()
  const pkg = packages.find(p => p.id === packageId)
  if (pkg) {
    // Recalculate average rating
    const currentTotal = pkg.rating * pkg.reviewCount
    const newCount = pkg.reviewCount + 1
    const newRating = Number(((currentTotal + reviewData.rating) / newCount).toFixed(1))
    pkg.rating = newRating
    pkg.reviewCount = newCount
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages))
  }
  return true
}

// -----------------------------------------------------------------------------
// DEMO RESET & DATA PORTABILITY (Essential for Live Presentations)
// -----------------------------------------------------------------------------

export function resetToDemoData() {
  localStorage.setItem(KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES))
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS))
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify(['pkg-1', 'pkg-2']))
  return true
}

export function exportDataJSON() {
  return JSON.stringify({
    packages: getPackages(),
    bookings: getBookings(),
    wishlist: getWishlist(),
    exportedAt: new Date().toISOString()
  }, null, 2)
}

export function importDataJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (data.packages) localStorage.setItem(KEYS.PACKAGES, JSON.stringify(data.packages))
    if (data.bookings) localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(data.bookings))
    if (data.wishlist) localStorage.setItem(KEYS.WISHLIST, JSON.stringify(data.wishlist))
    return true
  } catch (err) {
    console.error('Invalid JSON import', err)
    return false
  }
}
