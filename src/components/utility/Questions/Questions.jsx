
 // score (22-27) spontaneous Brain
 //score (15-21) Balance Brain 
 // score (28-33) Persistent Brain
 //score (34-39) Sensitive  Brain
 // score (40-45) conscious brain

const Questions = () => {
  const questions = [
    {
      id: 1,
      code: 8081,
      question: {
        en: "What role do you play in your friend circle?",
        bn: "আপনার বন্ধু মহলে আপনি কোন ভূমিকাটি পালন করে থাকেন ?"
      },
      options: [
        { 
          id: 1, 
          option: {
            en: "Always ready to help friends",
            bn: "বন্ধুদের সাহায্য করতে প্রস্তুত থাকেন"
          }, 
          score: 3 
        },
        { 
          id: 2, 
          option: {
            en: "You're an expert at making friends laugh",
            bn: "আপনি বন্ধুদের হাসাতে এক্সপার্ট"
          }, 
          score: 2 
        },
        { 
          id: 3, 
          option: {
            en: "Always engage in serious discussions with friends",
            bn: "সর্বদা বন্ধুদের সাথে গম্ভীর আলোচনা করেন"
          }, 
          score: 1 
        },
      ],
    },
    {
      id: 2,
      code: 8082,
      question: {
        en: "What do you do when something doesn't go according to your plan?",
        bn: "কোনো কাজ যদি আপনার পরিকল্পনা অনুযায়ী না হয় তখন আপনি কি করেন ?"
      },
      options: [
        { 
          id: 1, 
          option: {
            en: "Quickly find an alternative solution",
            bn: "দ্রুত কোন বিকল্প বের করে ফেলেন"
          }, 
          score: 2 
        },
        { 
          id: 2, 
          option: {
            en: "Feel disappointed",
            bn: "হতাশ হয়ে পড়েন"
          }, 
          score: 3 
        },
        { 
          id: 3, 
          option: {
            en: "Handle the situation with a cool head",
            bn: "ঠান্ডা মাথায় পরিস্থিতি সামলান"
          }, 
          score: 1 
        },
      ],
    },
    {
      id: 3,
      code: 8083,
      question: {
        en: "How do you behave in relationships?",
        bn: "কোনো সম্পর্কের ক্ষেত্রে আপনি কেমন আচরণ করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "You are very careful and open in relationships",
            bn: "সম্পর্কের ক্ষেত্রে আপনি খুবই সতর্ক এবং খোলামেলা থাকেন"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "Stay cautious due to fear of being deceived in relationships",
            bn: "সম্পর্কের ধোকা খাওয়ার ভয়ে সতর্কতা অবলম্বন করেন"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Initially cautious but gradually start loving deeply",
            bn: "প্রথমে একটু সতর্ক থাকলেও ধীরে ধীরে গভীর ভালবাসতে শুরু করেন"
          },
          score: 1,
        },
      ],
    },
    {
      id: 4,
      code: 8084,
      question: {
        en: "How do you learn something new?",
        bn: "আপনি নতুন কোন জিনিস কিভাবে শিখেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Follow proper instructions for that task",
            bn: "সে কাজের জন্য থাকা সঠিক নির্দেশনা অনুসরণ করেন"
          },
          score: 1,
        },
        {
          id: 2,
          option: {
            en: "Jump straight into work and learn by doing",
            bn: "সোজা কাজে লেগে পড়েন কাজ করতে করতে শিখেন"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Keep practicing until you master it",
            bn: "যতক্ষণ না শিখছেন ততক্ষণ প্র্যাকটিস চালিয়ে যান"
          },
          score: 3,
        },
      ],
    },
    {
      id: 5,
      code: 8085,
      question: {
        en: "How do you feel at social events?",
        bn: "সামাজিক কোন অনুষ্ঠানে আপনার অনুভূতি কেমন হয় ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Enjoy it immensely",
            bn: "প্রচুর উপভোগ করেন"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "Feel very uncomfortable",
            bn: "খুবই অস্বস্তি বোধ হয়"
          },
          score: 1,
        },
        {
          id: 3,
          option: {
            en: "Feel awkward at first but gradually adjust",
            bn: "প্রথমে আনিক ফিল হলেও ধীরে ধীরে মানিয়ে নেন"
          },
          score: 2,
        },
      ],
    },
    {
      id: 6,
      code: 8086,
      question: {
        en: "How do you handle sudden major changes in your life?",
        bn: "আপনার জীবনে হঠাৎ কোন বড় ধরনের পরিবর্তন হলে তা কিভাবে সামলাম ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Get panicked at first but gradually adapt",
            bn: "প্রথমে ঘাবড়ে গেলেও ধীরে ধীরে মানিয়ে নেই"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "Analyze the matter thoroughly then make decisions",
            bn: "ব্যাপারটি ভালোভাবে বিশ্লেষণ করে তারপর সিদ্ধান্ত নেই"
          },
          score: 1,
        },
        {
          id: 3,
          option: {
            en: "Stay calm from the beginning and handle the situation beautifully",
            bn: "প্রথম থেকে শান্ত থেকে সুন্দরভাবে পরিস্থিতি সামলান"
          },
          score: 2,
        },
      ],
    },
    {
      id: 7,
      code: 8087,
      question: {
        en: "Which aspects within yourself do you consider most valuable?",
        bn: "আপনার ভেতরে থাকা কোন কোন দিক কে আপনি সবচেয়ে বেশি মূল্যবান বলে মনে করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Ability to be cautious and calm",
            bn: "সতর্ক এবং শান্ত থাকার ক্ষমতা"
          },
          score: 1,
        },
        {
          id: 2,
          option: {
            en: "Creativity and ability to take risks",
            bn: "সৃজনশীলতা এবং ঝুঁকি নেওয়ার ক্ষমতা"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Patience and ability to work hard",
            bn: "ধৈর্যশীল এবং অধিক পরিশ্রম করার ক্ষমতা"
          },
          score: 3,
        },
      ],
    },
    {
      id: 8,
      code: 8088,
      question: {
        en: "How do you solve problems?",
        bn: "আপনি কিভাবে কোন সমস্যার সমাধান করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Plan with a cool head",
            bn: "ঠান্ডা মাথায় প্ল্যান করে"
          },
          score: 1,
        },
        {
          id: 2,
          option: {
            en: "Make decisions from the heart",
            bn: "মন থেকে সিদ্ধান্ত নেন"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Leave it to time - whatever will be, will be",
            bn: "সময়ের উপর ব্যাপারটিকে ছেড়ে যা হবার হবে"
          },
          score: 3,
        },
      ],
    },
    {
      id: 9,
      code: 8089,
      question: {
        en: "How do you plan your day?",
        bn: "আপনি আপনার দিনটাকে কিভাবে প্ল্যান করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Follow a strict routine",
            bn: "কঠোর একটি রুটিন মেনে চলেন"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "You don't think about these things",
            bn: "এইসব নিয়ে আপনি ভাবেন না"
          },
          score: 1,
        },
        {
          id: 3,
          option: {
            en: "Make an approximate plan",
            bn: "আনুমানিক একটা প্ল্যান করে রাখেন"
          },
          score: 2,
        },
      ],
    },
    {
      id: 10,
      code: 80810,
      question: {
        en: "How do you react when someone criticizes you?",
        bn: "কেউ আপনার সমালোচনা করলে কিভাবে রিয়াক্ট করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "It hurts you a lot",
            bn: "আপনার খুব খারাপ লাগে"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "Stay neutral and think about who is criticizing and what about",
            bn: "নিরপেক্ষ থাকেন কে সমালোচনা করছে এবং কি নিয়ে করছে তা নিয়ে ভাবেন"
          },
          score: 1,
        },
        {
          id: 3,
          option: {
            en: "Don't care at all",
            bn: "পাত্তাই দেন না"
          },
          score: 2,
        },
      ],
    },
    {
      id: 11,
      code: 80811,
      question: {
        en: "What do you do when you suddenly find yourself under pressure?",
        bn: "হঠাৎ করে কোন চাপের মধ্যে পড়ে গেলে আপনি কি করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Work according to a cool-headed plan",
            bn: "ঠান্ডা মাথার প্ল্যান অনুযায়ী কাজ করেন"
          },
          score: 1,
        },
        {
          id: 2,
          option: {
            en: "Take quick action",
            bn: "দ্রুত পদক্ষেপ নেন"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Focus on life and start working hard",
            bn: "জীবন মনোযোগ দিয়ে কঠোর পরিশ্রম করা শুরু করেন"
          },
          score: 3,
        },
      ],
    },
    {
      id: 12,
      code: 80812,
      question: {
        en: "How do you react in emotional situations?",
        bn: "ইমোশনাল কোন পরিস্থিতিতে আপনি কিভাবে রিয়াক্ট করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Become very emotional",
            bn: "খুবই আবেগি হয়ে পড়েন"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "Think with logic",
            bn: "যুক্তি দিয়ে ভাবেন"
          },
          score: 1,
        },
        {
          id: 3,
          option: {
            en: "Easily compose yourself",
            bn: "সহজেই নিজেকে সামলায় নেন"
          },
          score: 2,
        },
      ],
    },
    {
      id: 13,
      code: 80813,
      question: {
        en: "How do you make big decisions in life?",
        bn: "জীবনে বড় কোনো ডিসিশন আপনি কিভাবে নেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Think thoroughly before making decisions",
            bn: "খুভালোভাবে চিন্তা ভাবনা করে তারপর নেন"
          },
          score: 1,
        },
        {
          id: 2,
          option: {
            en: "Make decisions based on what your heart wants",
            bn: "মন চায় বলে তাই সিদ্ধান্ত নেই"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Seek advice from others",
            bn: "অন্য কারো কাছ থেকে পরামর্শ চান"
          },
          score: 3,
        },
      ],
    },
    {
      id: 14,
      code: 80814,
      question: {
        en: "What is your biggest motivation?",
        bn: "আপনার জন্য সবচেয়ে বড় অনুপ্রেরণা কি ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "Freedom to do any work",
            bn: "যেকোনো কাজ করার স্বাধীনতা"
          },
          score: 1,
        },
        {
          id: 2,
          option: {
            en: "Enthusiasm to do something new",
            bn: "নতুন কোনো কাজ করার উৎসাহ"
          },
          score: 2,
        },
        {
          id: 3,
          option: {
            en: "Satisfaction of completing any task perfectly",
            bn: "কোনো কাজ নিখুঁতভাবে সম্পন্ন করার তৃপ্তি"
          },
          score: 3,
        },
      ],
    },
    {
      id: 15,
      code: 80815,
      question: {
        en: "How do you react when meeting new people?",
        bn: "নতুন কোনো মানুষের সাথে দেখা হলে আপনি কিভাবে রিয়াক্ট করেন ?"
      },
      options: [
        {
          id: 1,
          option: {
            en: "First examine them carefully",
            bn: "প্রথমে তাকে ভালোভাবে যাচাই করেন"
          },
          score: 3,
        },
        {
          id: 2,
          option: {
            en: "Feel uncomfortable talking to them",
            bn: "তার সাথে কথা বলতে অস্বস্তি বোধ করেন"
          },
          score: 1,
        },
        {
          id: 3,
          option: {
            en: "Can easily mix with them",
            bn: "সহজেই মিশে যেতে পারেন"
          },
          score: 2,
        },
      ],
    },
  ];
  return questions;
};

export default Questions;