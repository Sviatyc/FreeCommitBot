const { Telegraf } = require('telegraf');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { auth, db } = require('./firebase');  
const { doc, setDoc } = require('firebase/firestore');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const userStates = {};

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
  ctx.reply('Please provide your email to register. Example: "email@example.com"');
});

bot.action('login', (ctx) => {
  const userId = String(ctx.from?.id); 
  userStates[userId] = { step: 'email', isRegistering: false }; 
  ctx.reply('Please provide your email to log in. Example: "email@example.com"');
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
          userId: '123',
          email: userState.email
        });

      } else {
        await signInWithEmailAndPassword(auth, userState.email, password);
        ctx.reply('You are logged in! 🎉');

        const userRef = doc(db, 'users', userId);  
        await setDoc(userRef, {
          userId: '123',
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

bot.launch();

console.log('Telegram bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
