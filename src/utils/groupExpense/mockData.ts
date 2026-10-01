import { Group, GroupExpense, GroupMember, GroupSettlement } from '../../types/groupExpense';

export const CURRENT_USER: GroupMember = {
  id: 'user_akshay',
  name: 'Akshay Salunke',
  phone: '+91 98765 00000',
  email: 'akshay@example.com',
  initials: 'AS',
  color: '#087AA6',
  isCurrentUser: true,
  isAdmin: true,
};

export const CONTACTS_POOL: GroupMember[] = [
  CURRENT_USER,
  {
    id: 'user_rahul',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
    initials: 'RS',
    color: '#845EF7',
  },
  {
    id: 'user_sonali',
    name: 'Sonali Patil',
    phone: '+91 98765 43211',
    email: 'sonali@example.com',
    initials: 'SP',
    color: '#E64980',
  },
  {
    id: 'user_pratik',
    name: 'Pratik More',
    phone: '+91 98765 43212',
    email: 'pratik@example.com',
    initials: 'PM',
    color: '#F59F00',
  },
  {
    id: 'user_priya',
    name: 'Priya Deshmukh',
    phone: '+91 98765 43213',
    email: 'priya@example.com',
    initials: 'PD',
    color: '#20C997',
  },
  {
    id: 'user_amit',
    name: 'Amit Verma',
    phone: '+91 98765 43214',
    email: 'amit@example.com',
    initials: 'AV',
    color: '#339AF0',
  },
  {
    id: 'user_sneha',
    name: 'Sneha Kulkarni',
    phone: '+91 98765 43215',
    email: 'sneha@example.com',
    initials: 'SK',
    color: '#FF6B6B',
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group_goa',
    name: 'Goa Trip',
    description: 'Goa trip expenses & stay',
    avatarIcon: '🌴',
    currency: 'INR',
    createdBy: 'user_akshay',
    createdAt: '2026-10-01T08:00:00.000Z',
    simplifyDebts: true,
    defaultSplit: 'equal',
    members: [
      CURRENT_USER,
      CONTACTS_POOL[1], // Rahul
      CONTACTS_POOL[2], // Sonali
      CONTACTS_POOL[3], // Pratik
    ],
  },
  {
    id: 'group_flatmates',
    name: 'Flatmates',
    description: 'Monthly flat rent, groceries & bills',
    avatarIcon: '🏠',
    currency: 'INR',
    createdBy: 'user_akshay',
    createdAt: '2026-09-15T08:00:00.000Z',
    simplifyDebts: true,
    defaultSplit: 'equal',
    members: [
      CURRENT_USER,
      CONTACTS_POOL[1], // Rahul
      CONTACTS_POOL[2], // Sonali
    ],
  },
  {
    id: 'group_friends',
    name: 'Friends',
    description: 'Weekend hangouts and movies',
    avatarIcon: '🍕',
    currency: 'INR',
    createdBy: 'user_akshay',
    createdAt: '2026-08-20T08:00:00.000Z',
    simplifyDebts: true,
    defaultSplit: 'equal',
    members: [
      CURRENT_USER,
      CONTACTS_POOL[1],
      CONTACTS_POOL[2],
      CONTACTS_POOL[3],
      CONTACTS_POOL[4],
    ],
  },
  {
    id: 'group_office',
    name: 'Office Team',
    description: 'Team lunches & coffee breaks',
    avatarIcon: '💼',
    currency: 'INR',
    createdBy: 'user_akshay',
    createdAt: '2026-07-10T08:00:00.000Z',
    simplifyDebts: true,
    defaultSplit: 'equal',
    members: [
      CURRENT_USER,
      CONTACTS_POOL[1],
      CONTACTS_POOL[2],
      CONTACTS_POOL[3],
      CONTACTS_POOL[4],
      CONTACTS_POOL[5],
    ],
  },
];

export const INITIAL_EXPENSES: GroupExpense[] = [
  // Goa Trip expenses matching reference image
  {
    id: 'exp_goa_1',
    groupId: 'group_goa',
    description: 'Dinner',
    amount: 2400,
    paidBy: 'user_akshay',
    splitType: 'equal',
    participants: [
      { userId: 'user_akshay', amount: 600 },
      { userId: 'user_rahul', amount: 600 },
      { userId: 'user_sonali', amount: 600 },
      { userId: 'user_pratik', amount: 600 },
    ],
    category: 'Food & Dining',
    date: '2026-10-01T20:30:00.000Z',
    notes: 'Dinner at Britto’s',
    createdAt: '2026-10-01T20:30:00.000Z',
  },
  {
    id: 'exp_goa_2',
    groupId: 'group_goa',
    description: 'Cab',
    amount: 800,
    paidBy: 'user_rahul',
    splitType: 'equal',
    participants: [
      { userId: 'user_akshay', amount: 200 },
      { userId: 'user_rahul', amount: 200 },
      { userId: 'user_sonali', amount: 200 },
      { userId: 'user_pratik', amount: 200 },
    ],
    category: 'Transport',
    date: '2026-10-01T17:30:00.000Z',
    notes: 'Airport to hotel cab',
    createdAt: '2026-10-01T17:30:00.000Z',
  },
  {
    id: 'exp_goa_3',
    groupId: 'group_goa',
    description: 'Hotel',
    amount: 6000,
    paidBy: 'user_akshay',
    splitType: 'equal',
    participants: [
      { userId: 'user_akshay', amount: 1500 },
      { userId: 'user_rahul', amount: 1500 },
      { userId: 'user_sonali', amount: 1500 },
      { userId: 'user_pratik', amount: 1500 },
    ],
    category: 'Travel',
    date: '2026-10-01T12:10:00.000Z',
    notes: 'Resort booking deposit',
    createdAt: '2026-10-01T12:10:00.000Z',
  },
  {
    id: 'exp_goa_4',
    groupId: 'group_goa',
    description: 'Snacks',
    amount: 450,
    paidBy: 'user_sonali',
    splitType: 'equal',
    participants: [
      { userId: 'user_rahul', amount: 150 },
      { userId: 'user_sonali', amount: 150 },
      { userId: 'user_pratik', amount: 150 },
    ],
    category: 'Food & Dining',
    date: '2026-10-01T10:15:00.000Z',
    notes: 'Beach shack drinks & fries',
    createdAt: '2026-10-01T10:15:00.000Z',
  },

  // Flatmates expense (You owe ₹430)
  {
    id: 'exp_flat_1',
    groupId: 'group_flatmates',
    description: 'Groceries & Milk',
    amount: 1290,
    paidBy: 'user_rahul',
    splitType: 'equal',
    participants: [
      { userId: 'user_akshay', amount: 430 },
      { userId: 'user_rahul', amount: 430 },
      { userId: 'user_sonali', amount: 430 },
    ],
    category: 'Food & Dining',
    date: '2026-09-28T11:00:00.000Z',
    createdAt: '2026-09-28T11:00:00.000Z',
  },

  // Office Team expense (You are owed ₹560)
  {
    id: 'exp_office_1',
    groupId: 'group_office',
    description: 'Team Lunch Buffet',
    amount: 3360,
    paidBy: 'user_akshay',
    splitType: 'equal',
    participants: [
      { userId: 'user_akshay', amount: 560 },
      { userId: 'user_rahul', amount: 560 },
      { userId: 'user_sonali', amount: 560 },
      { userId: 'user_pratik', amount: 560 },
      { userId: 'user_priya', amount: 560 },
      { userId: 'user_amit', amount: 560 },
    ],
    category: 'Food & Dining',
    date: '2026-09-30T13:30:00.000Z',
    createdAt: '2026-09-30T13:30:00.000Z',
  },
];

export const INITIAL_SETTLEMENTS: GroupSettlement[] = [];
