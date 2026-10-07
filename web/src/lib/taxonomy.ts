import type { Emotion } from './types';
export const emotions: Emotion[] = [
  { slug:'happy', name:'Happy', symbol:'☀', color:'#d5af62', category:'warm' },
  { slug:'excited', name:'Excited', symbol:'✦', color:'#d48662', category:'warm' },
  { slug:'hopeful', name:'Hopeful', symbol:'↗', color:'#9da47b', category:'warm' },
  { slug:'grateful', name:'Grateful', symbol:'✳', color:'#c5b088', category:'warm' },
  { slug:'loved', name:'Loved', symbol:'♡', color:'#bd7e83', category:'warm' },
  { slug:'love', name:'In love', symbol:'♥', color:'#c57469', category:'warm' },
  { slug:'peaceful', name:'Peaceful', symbol:'≈', color:'#93aaa1', category:'quiet' },
  { slug:'relieved', name:'Relieved', symbol:'⌁', color:'#a4b99d', category:'quiet' },
  { slug:'sad', name:'Sad', symbol:'☂', color:'#899aab', category:'heavy' },
  { slug:'lonely', name:'Lonely', symbol:'◌', color:'#a99abb', category:'heavy' },
  { slug:'anxious', name:'Anxious', symbol:'〰', color:'#c3a077', category:'heavy' },
  { slug:'overwhelmed', name:'Overwhelmed', symbol:'≋', color:'#a79a8c', category:'heavy' },
  { slug:'angry', name:'Angry', symbol:'↯', color:'#bf745f', category:'heavy' },
  { slug:'frustrated', name:'Frustrated', symbol:'⌇', color:'#b0876d', category:'heavy' },
  { slug:'jealous', name:'Jealous', symbol:'◇', color:'#97a47d', category:'heavy' },
  { slug:'insecure', name:'Insecure', symbol:'◒', color:'#ba9aa4', category:'heavy' },
  { slug:'embarrassed', name:'Embarrassed', symbol:'◍', color:'#c89b95', category:'heavy' },
  { slug:'confused', name:'Confused', symbol:'?', color:'#b5a28b', category:'quiet' },
  { slug:'disappointed', name:'Disappointed', symbol:'↘', color:'#949ca0', category:'heavy' },
  { slug:'scared', name:'Scared', symbol:'!', color:'#aa9bb6', category:'heavy' },
  { slug:'numb', name:'Numb', symbol:'—', color:'#a7aaa1', category:'quiet' },
  { slug:'bored', name:'Bored', symbol:'…', color:'#b5b19e', category:'quiet' },
];
export const causes = ['Love','Relationship','Dating','Friends','Family','Career','Work','College','School','Money','Appearance','Health','Future','Past','Social media','Self','Someone else','Politics','Sports','Entertainment','Other'];
export const intentions = ['Talk to someone','Tell them how I feel','Do nothing','Wait','Distance myself','Confront someone','Work on it','Leave','Cry','Sleep','Distract myself','Celebrate','Reach out',"I don’t know",'Something else'];
export const outcomes = ['It got better','It got worse','Nothing changed','I did what I planned','I changed my mind','Something unexpected happened',"I’d rather not say"];
export const reportReasons = ['harassment','hate','sexual','self-harm','violence','personal information','spam','other'];
export const emotionBySlug = (slug: string) => emotions.find(e=>e.slug === slug) ?? emotions[0];
export const COHORT_MINIMUM = 30;
