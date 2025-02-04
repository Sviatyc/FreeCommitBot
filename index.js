const { Telegraf } = require('telegraf');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { auth, db } = require('./firebase');  
const { doc, setDoc, getDoc } = require('firebase/firestore');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const userStates = {};
const loggedInUsers = {}; 

bot.start((ctx) => {
  ctx.reply('Welcome to the FreeCommit bot 🤠 Select your action:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Register 📝', callback_data: 'register' },
          { text: 'Login 🔑', callback_data: 'login' }
        ]
      ]
    }
  });
});

bot.action('register', (ctx) => {
  const userId = String(ctx.from?.id); 
  userStates[userId] = { step: 'email', isRegistering: true }; 
  ctx.reply('Please provide your email to register');
});

bot.action('login', (ctx) => {
  const userId = String(ctx.from?.id); 
  userStates[userId] = { step: 'email', isRegistering: false }; 
  ctx.reply('Please provide your email to log in');
});

bot.on('text', async (ctx) => {
  const userId = String(ctx.from?.id); 
  const userInput = ctx.message?.text.trim();
  
  if (!userStates[userId]) {
    return;
  }

  const userState = userStates[userId];
  
  if (userState.step === 'email') {
    userState.email = userInput; 
    userState.step = 'password'; 
    ctx.reply('Great! Now, please provide your password.');
  } else if (userState.step === 'password') {
    const password = userInput;
    
    try {
      if (!userState.email) {
        ctx.reply('Email is missing.');
        return;
      }

      if (userState.isRegistering) {
        await createUserWithEmailAndPassword(auth, userState.email, password);
        ctx.reply('You have successfully registered! 🎉 Please log in to proceed.');

        const userRef = doc(db, 'users', userId);  
        await setDoc(userRef, {
          userId,
          email: userState.email
        });

      } else {
        await signInWithEmailAndPassword(auth, userState.email, password);
        
        loggedInUsers[userId] = userState.email;

        ctx.reply('You are logged in! 🎉', {
          reply_markup: {
            keyboard: [
              [{ text: 'Profile 👤' }], 
              [{ text: 'Create 🆕' }, { text: 'Connect 🔗' }]
            ],
            resize_keyboard: true
          }
        });

        const userRef = doc(db, 'users', userId);  
        await setDoc(userRef, {
          userId,
          email: userState.email
        }, { merge: true }); 
      }
      
      delete userStates[userId];
    } catch (error) {
      if (error instanceof Error) {
        ctx.reply('Error occurred: ' + error.message);
      } else {
        ctx.reply('An unknown error occurred');
      }
      
      delete userStates[userId]; 
    }
  }
});

bot.hears('Profile 👤', async (ctx) => {
  const userId = String(ctx.from?.id);

  if (!loggedInUsers[userId]) {
    ctx.reply('You are not logged in. Please log in first.');
    return;
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    ctx.reply(`📌 *Your Profile:*\n\n📧 Email: ${userData.email}`, { parse_mode: 'Markdown' });
  } else {
    ctx.reply('Profile data not found.');
  }
});

bot.hears('Create 🆕', (ctx) => {
  ctx.reply('You clicked "Create". Here you can create something new.');
});

bot.hears('Connect 🔗', (ctx) => {
  ctx.reply('You clicked "Connect". Here you can connect with others.');
});

bot.launch();

console.log('Telegram bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
