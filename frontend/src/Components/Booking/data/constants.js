// Studio Packages Data
export const studioPackages = [
  {
    id: '1',
    name: 'Basic Photography Package',
    description: 'Perfect for portrait sessions and small shoots',
    price: 120,
    duration: '3 hours',
    features: [
      'Professional lighting setup',
      'Backdrop and props included',
      'Basic camera equipment',
      'Studio space access',
      'Equipment setup assistance',
      'Complimentary refreshments'
    ],
    image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    name: 'Premium Studio Package',
    description: 'Complete photography studio with advanced equipment',
    price: 280,
    duration: '6 hours',
    features: [
      'Professional DSLR cameras',
      'Advanced lighting equipment',
      'Multiple backdrop options',
      'Props and accessories',
      'Makeup station access',
      'Photo editing consultation',
      'Equipment technician support',
      'Catering included'
    ],
    image: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    name: 'Full Day Studio Rental',
    description: 'Complete studio access for professional shoots',
    price: 450,
    duration: '10 hours',
    features: [
      'Exclusive studio access',
      'Premium camera equipment',
      'Professional lighting systems',
      'All backdrops and props',
      'Makeup and wardrobe area',
      'Photo editing suite access',
      'Dedicated technical support',
      'Full catering service',
      'Client consultation included'
    ],
    image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    name: 'Portrait Photography Special',
    description: 'Specialized package for professional portraits and headshots',
    price: 180,
    duration: '4 hours',
    features: [
      'Professional portrait lighting',
      'Multiple backdrop selections',
      'High-resolution DSLR camera',
      'Professional makeup artist',
      'Wardrobe consultation',
      '50+ edited photos included',
      'Same-day photo preview',
      'USB drive with all photos'
    ],
    image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '5',
    name: 'Wedding Photography Package',
    description: 'Complete wedding photography with premium equipment',
    price: 850,
    duration: '12 hours',
    features: [
      'Two professional photographers',
      'Premium camera equipment set',
      'Professional lighting for ceremonies',
      'Drone photography included',
      'Unlimited photo coverage',
      'Professional photo editing',
      'Wedding album creation',
      'Online gallery for guests',
      'Engagement session included'
    ],
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '6',
    name: 'Product Photography Studio',
    description: 'Professional product photography for e-commerce and marketing',
    price: 320,
    duration: '5 hours',
    features: [
      'Product photography lighting setup',
      'White backdrop and colored backgrounds',
      'Macro lens for detailed shots',
      'Professional camera with tripod',
      '360-degree product photography',
      'Photo retouching included',
      'Multiple angle shots',
      'High-resolution image delivery'
    ],
    image: 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '7',
    name: 'Fashion Photography Package',
    description: 'High-end fashion photography with professional styling',
    price: 650,
    duration: '8 hours',
    features: [
      'Professional fashion photographer',
      'High-end camera equipment',
      'Professional lighting systems',
      'Multiple backdrop options',
      'Professional stylist included',
      'Makeup and hair artist',
      'Wardrobe consultation',
      'Professional photo editing',
      'Portfolio-ready images'
    ],
    image: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8',
    name: 'Event Photography Package',
    description: 'Complete event coverage with professional equipment',
    price: 480,
    duration: '6 hours',
    features: [
      'Professional event photographer',
      'Multiple camera setup',
      'Professional flash equipment',
      'Candid and posed photography',
      'Group photo arrangements',
      'Real-time photo sharing',
      'Professional editing included',
      'Online photo gallery',
      'Print-ready image formats'
    ],
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '9',
    name: 'Camera Equipment Rental Only',
    description: 'Rent professional camera equipment without studio space',
    price: 95,
    duration: '24 hours',
    features: [
      'Professional DSLR camera',
      'Multiple lens options',
      'Professional tripod',
      'External flash units',
      'Memory cards and batteries',
      'Camera bag included',
      'Equipment insurance covered',
      '24/7 technical support'
    ],
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

// Time Slots Generator
export const generateTimeSlots = () => {
  const slots = [];
  const today = new Date();
  
  for (let day = 0; day < 14; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    const timeSlots = [
      '09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM'
    ];
    
    timeSlots.forEach((time, index) => {
      slots.push({
        id: `${day}-${index}`,
        time,
        date: date.toISOString().split('T')[0],
        available: Math.random() > 0.3,
        price: 30 + Math.floor(Math.random() * 70)
      });
    });
  }
  
  return slots;
};