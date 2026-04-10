require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Property = require('../models/Property');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔌 Connected');

  await User.deleteMany({});
  await Property.deleteMany({});

  // Don't manually hash - let the User model's pre-save hook handle hashing
  const admin  = await User.create({ name:'Admin User',    email:'admin@gbrentals.com', cnic:'35202-0000000-1', password:'admin123', role:'admin',  phone:'+92-300-0000001', isActive:true, isVerified:true });
  const owner  = await User.create({ name:'Property Owner',email:'owner@gbrentals.com', cnic:'35202-1234567-2', password:'owner123', role:'owner',  phone:'+92-300-1234567', isActive:true, isVerified:true });
  const tenant = await User.create({ name:'John Tenant',   email:'user@gbrentals.com',  cnic:'35202-7654321-3', password:'user123',  role:'user',   phone:'+92-300-7654321', isActive:true, isVerified:false });

  const PROPS = [
    { title:'Luxury Beach Villa',        type:'villa',     price:150000, priceType:'monthly', status:'approved', description:'Stunning beachfront villa with panoramic ocean views. 4 spacious bedrooms, private pool, and direct beach access.', location:{address:'100 DHA Phase 5', city:'Karachi',    state:'Sindh',  country:'Pakistan', zipCode:'75500'}, features:{bedrooms:4,bathrooms:3,area:3200,parking:true,furnished:true,pool:true},  images:[{url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'}], isFeatured:true },
    { title:'Modern Downtown Apartment', type:'apartment', price:45000,  priceType:'monthly', status:'approved', description:'Contemporary 2-bedroom apartment in the heart of Lahore. Walking distance to offices and transit.', location:{address:'Gulberg III',       city:'Lahore',     state:'Punjab', country:'Pakistan', zipCode:'54000'}, features:{bedrooms:2,bathrooms:2,area:1100,parking:true,gym:true,petFriendly:true}, images:[{url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}], isFeatured:true },
    { title:'Cozy Studio Near University',type:'studio',   price:18000,  priceType:'monthly', status:'rented',   description:'Charming studio minutes from FAST University campus. Ideal for students or young professionals.', location:{address:'Block H PECHS',         city:'Karachi',    state:'Sindh',  country:'Pakistan', zipCode:'75400'}, features:{bedrooms:1,bathrooms:1,area:520, furnished:true}, images:[{url:'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'}], isFeatured:false },
    { title:'Spacious Family Home',      type:'house',     price:85000,  priceType:'monthly', status:'approved', description:'Beautiful 4-bedroom home in a quiet neighborhood with large garden.', location:{address:'Bahria Town Phase 4',   city:'Rawalpindi', state:'Punjab', country:'Pakistan', zipCode:'46000'}, features:{bedrooms:4,bathrooms:3,area:2800,parking:true,pool:true,petFriendly:true},  images:[{url:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}], isFeatured:true },
    { title:'Penthouse with City Views', type:'apartment', price:220000, priceType:'monthly', status:'approved', description:'Exclusive top-floor penthouse with panoramic city views. Concierge service included.', location:{address:'Clifton Block 5',        city:'Karachi',    state:'Sindh',  country:'Pakistan', zipCode:'75600'}, features:{bedrooms:3,bathrooms:3,area:2400,parking:true,furnished:true,gym:true},   images:[{url:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}], isFeatured:true },
    { title:'Pending Review Property',   type:'house',     price:55000,  priceType:'monthly', status:'pending',  description:'Recently submitted property awaiting admin review. Lovely 3-bed home with garden.', location:{address:'Garden Town',          city:'Lahore',     state:'Punjab', country:'Pakistan', zipCode:'54600'}, features:{bedrooms:3,bathrooms:2,area:1600,parking:true}, images:[{url:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'}], isFeatured:false },
    { title:'Commercial Office Space',   type:'commercial',price:300000, priceType:'monthly', status:'approved', description:'Modern open-plan office in prime business district. Suitable for 30-50 employees.', location:{address:'Blue Area',             city:'Islamabad',  state:'ICT',    country:'Pakistan', zipCode:'44000'}, features:{bedrooms:0,bathrooms:4,area:5000,parking:true,furnished:true}, images:[{url:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'}], isFeatured:false },
  ];

  for (const p of PROPS) await Property.create({ ...p, owner: owner._id });

  console.log('\n✅ Seeded successfully!');
  console.log('─────────────────────────────────────────');
  console.log('  Admin:  admin@gbrentals.com / admin123  (CNIC: 35202-0000000-1)');
  console.log('  Owner:  owner@gbrentals.com / owner123  (CNIC: 35202-1234567-2)');
  console.log('  Tenant: user@gbrentals.com  / user123   (CNIC: 35202-7654321-3)');
  console.log('  Login with CNIC or Email + Password');
  console.log('─────────────────────────────────────────');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
