const fs = require('fs');

const data = {
  "quiz": [
    {
      "question": "What moves faster than fairies and witches in the poem?",
      "options": [
        "A galloping horse",
        "A flying bird",
        "A rushing train",
        "A running child"
      ],
      "answer": "A rushing train",
      "explanation": "The entire poem describes the speed of a train moving 'faster than fairies, faster than witches'."
    },
    {
      "question": "Which of these are mentioned in the same line as 'ditches'?",
      "options": [
        "Hedges",
        "Stations",
        "Brambles",
        "Rivers"
      ],
      "answer": "Hedges",
      "explanation": "The poem says, 'Bridges and houses, hedges and ditches'."
    },
    {
      "question": "What is charging along like troops in a battle?",
      "options": [
        "The child gathering brambles",
        "The train",
        "The horses and cattle",
        "The driving rain"
      ],
      "answer": "The train",
      "explanation": "The train moves with great speed and force, compared to troops charging in a battle."
    },
    {
      "question": "Where are the horses and cattle located according to the poem?",
      "options": [
        "In the road",
        "On the green",
        "In the meadows",
        "Near the mill"
      ],
      "answer": "In the meadows",
      "explanation": "The poem explicitly states, 'All through the meadows the horses and cattle'."
    },
    {
      "question": "What do the sights of the hill and plain fly as thick as?",
      "options": [
        "Wink of an eye",
        "Driving rain",
        "Gathering brambles",
        "Troops in a battle"
      ],
      "answer": "Driving rain",
      "explanation": "The line reads: 'Fly as thick as driving rain;'."
    },
    {
      "question": "What whistles by 'in the wink of an eye'?",
      "options": [
        "Painted stations",
        "Horses and cattle",
        "A tramp",
        "A cart"
      ],
      "answer": "Painted stations",
      "explanation": "The poem says, 'Painted stations whistle by'."
    },
    {
      "question": "Who is clambering and scrambling?",
      "options": [
        "A child",
        "A tramp",
        "A man",
        "A fairy"
      ],
      "answer": "A child",
      "explanation": "The text states, 'Here is a child who clambers and scrambles'."
    },
    {
      "question": "What is the child gathering?",
      "options": [
        "Daisies",
        "Brambles",
        "Wood",
        "Stones"
      ],
      "answer": "Brambles",
      "explanation": "The poem mentions the child 'All by himself and gathering brambles'."
    },
    {
      "question": "Who stands and gazes?",
      "options": [
        "A child",
        "A tramp",
        "A man with a load",
        "A witch"
      ],
      "answer": "A tramp",
      "explanation": "The poem introduces 'a tramp who stands and gazes'."
    },
    {
      "question": "What is the green space used for?",
      "options": [
        "Stringing the daisies",
        "Gathering brambles",
        "Troops to battle",
        "The cart to run away"
      ],
      "answer": "Stringing the daisies",
      "explanation": "The text reads, 'And there is the green for stringing the daisies!'."
    },
    {
      "question": "What runs away in the road?",
      "options": [
        "A train",
        "A cart",
        "A horse",
        "A child"
      ],
      "answer": "A cart",
      "explanation": "The poem says, 'Here is a cart run away in the road'."
    },
    {
      "question": "Who is with the cart lumping along?",
      "options": [
        "A child and brambles",
        "A man and load",
        "A tramp and daisies",
        "Fairies and witches"
      ],
      "answer": "A man and load",
      "explanation": "The line is 'Lumping along with man and load'."
    },
    {
      "question": "What two landscape features are mentioned at the very end of the poem?",
      "options": [
        "A hill and a plain",
        "A bridge and a house",
        "A mill and a river",
        "A meadow and a green"
      ],
      "answer": "A mill and a river",
      "explanation": "The poet sees 'a mill and there is a river'."
    },
    {
      "question": "How long does each sight last?",
      "options": [
        "A few minutes",
        "Each a glimpse and gone forever",
        "An hour",
        "Until the train stops"
      ],
      "answer": "Each a glimpse and gone forever",
      "explanation": "The final line states, 'Each a glimpse and gone forever!'."
    },
    {
      "question": "Who is the poet of 'From A Railway Carriage'?",
      "options": [
        "William Wordsworth",
        "Robert Louis Stevenson",
        "John Keats",
        "Rabindranath Tagore"
      ],
      "answer": "Robert Louis Stevenson",
      "explanation": "The author is given as Robert Louis Stevenson."
    },
    {
      "question": "When was Robert Louis Stevenson born?",
      "options": [
        "3 December 1894",
        "15 August 1850",
        "13 Nov 1850",
        "12 September 1900"
      ],
      "answer": "13 Nov 1850",
      "explanation": "His birth date is provided as 13 Nov 1850."
    },
    {
      "question": "Which of these is NOT listed as one of Stevenson's famous works in the text?",
      "options": [
        "Treasure Island",
        "Kidnapped",
        "A Child’s Garden of Verses",
        "The Jungle Book"
      ],
      "answer": "The Jungle Book",
      "explanation": "The Jungle Book is not listed among his works; the others are."
    },
    {
      "question": "What is Stevenson's nationality?",
      "options": [
        "English",
        "Scottish",
        "Irish",
        "American"
      ],
      "answer": "Scottish",
      "explanation": "He is described as a 'Scottish novelist, poet, essayist, musician and travel writer'."
    },
    {
      "question": "What does the word 'Charge' mean in the glossary?",
      "options": [
        "To pay a fee",
        "To make a rush at or sudden attack",
        "To fill with electricity",
        "To walk slowly"
      ],
      "answer": "To make a rush at or sudden attack",
      "explanation": "The glossary defines Charge as 'To make a rush at or sudden attack upon a person or thing'."
    },
    {
      "question": "Which word means 'to climb or move in an awkward and laborious way'?",
      "options": [
        "Charge",
        "Glimpse",
        "Clamber",
        "Lumping"
      ],
      "answer": "Clamber",
      "explanation": "Clamber means to climb or move in an awkward way using both hands and feet."
    },
    {
      "question": "What are 'brambles'?",
      "options": [
        "Small stones on the road",
        "A prickly scrambling shrub of the rose family",
        "A type of train ticket",
        "Colorful flowers"
      ],
      "answer": "A prickly scrambling shrub of the rose family",
      "explanation": "Brambles are defined as a prickly scrambling shrub of the rose family, especially a blackberry."
    },
    {
      "question": "How is a 'tramp' defined in the text?",
      "options": [
        "A quick walk",
        "A person who travels on foot in search of work or as a beggar",
        "A heavy load",
        "A fast train"
      ],
      "answer": "A person who travels on foot in search of work or as a beggar",
      "explanation": "The glossary defines a tramp as a person who travels from place to place on foot in search of work or as a beggar."
    },
    {
      "question": "What does 'Stringing' mean?",
      "options": [
        "Hang so that it stretches in a long line",
        "Playing a musical instrument",
        "Tying a knot",
        "Running fast"
      ],
      "answer": "Hang so that it stretches in a long line",
      "explanation": "Stringing means to hang so that it stretches in a long line."
    },
    {
      "question": "Which glossary word means 'Carry with difficulty'?",
      "options": [
        "Glimpse",
        "Lumping",
        "Clamber",
        "Charge"
      ],
      "answer": "Lumping",
      "explanation": "Lumping is defined as 'Carry with difficulty'."
    },
    {
      "question": "What does 'Glimpse' mean?",
      "options": [
        "To look deeply",
        "See or perceive briefly or partially",
        "A shiny object",
        "To forget quickly"
      ],
      "answer": "See or perceive briefly or partially",
      "explanation": "A glimpse is to see or perceive briefly or partially."
    },
    {
      "question": "In the summary fill-in-the-blanks, what brings unique rhythms that inspire poets?",
      "options": [
        "Horses and cattle",
        "Fairies and witches",
        "Trains",
        "The driving rain"
      ],
      "answer": "Trains",
      "explanation": "Ever since their introduction, trains and their unique rhythms have inspired poets."
    },
    {
      "question": "Where is the poet sharing his experience from?",
      "options": [
        "A horse carriage",
        "A mountain top",
        "A railway carriage window",
        "A painted station"
      ],
      "answer": "A railway carriage window",
      "explanation": "He presents natural scenes seen from a railway carriage window."
    },
    {
      "question": "What line best sums up the poem according to the summary section?",
      "options": [
        "Faster than fairies, faster than witches",
        "Fly as thick as driving rain",
        "Each a glimpse and gone forever!",
        "Painted stations whistle by"
      ],
      "answer": "Each a glimpse and gone forever!",
      "explanation": "The summary notes the line that best sums up is the final one: 'Each a glimpse and gone forever!'."
    },
    {
      "question": "What is the date of Stevenson's death?",
      "options": [
        "3 December 1894",
        "13 November 1850",
        "15 August 1900",
        "12 September 1894"
      ],
      "answer": "3 December 1894",
      "explanation": "His biographical details state his lifespan as 13 Nov 1850 – 3 December 1894."
    },
    {
      "question": "What is Stevenson's middle name?",
      "options": [
        "Louis",
        "Arthur",
        "Balfour",
        "Edward"
      ],
      "answer": "Balfour",
      "explanation": "His full name is Robert Louis Balfour Stevenson."
    },
    {
      "question": "Why does the poet mention 'bridges and houses, hedges and ditches'?",
      "options": [
        "To show things moving slower than the train",
        "To list the sights flashing rapidly outside the train window",
        "To describe where the fairies live",
        "To explain where the train stops"
      ],
      "answer": "To list the sights flashing rapidly outside the train window",
      "explanation": "These are the rapid visual elements the poet sees as the train speeds past the landscape."
    },
    {
      "question": "Where is the child who is gathering brambles likely located?",
      "options": [
        "Inside the train",
        "In the city center",
        "In the rough countryside near the tracks",
        "At the painted station"
      ],
      "answer": "In the rough countryside near the tracks",
      "explanation": "The child clambering and gathering brambles is seen outside by the tracks in a natural, rugged setting."
    },
    {
      "question": "What does 'gathering brambles' suggest about the child's activity?",
      "options": [
        "He is playing a game with friends",
        "He is collecting blackberries from prickly bushes",
        "He is building a house",
        "He is trying to catch the train"
      ],
      "answer": "He is collecting blackberries from prickly bushes",
      "explanation": "Brambles are prickly shrubs (blackberries), so the child is carefully picking fruit or wood from them."
    },
    {
      "question": "What does 'painted stations whistle by' imply?",
      "options": [
        "The stations are blowing a whistle",
        "The train passes colorful stations so fast it sounds like a whistle or blur",
        "People are painting the station",
        "The train stops at every station"
      ],
      "answer": "The train passes colorful stations so fast it sounds like a whistle or blur",
      "explanation": "It conveys the extreme speed of the train moving past the stations with a rushing sound."
    },
    {
      "question": "In 'Each a glimpse and gone forever', what does 'each' refer to?",
      "options": [
        "Every passenger on the train",
        "Every single sight or scene passed by the train",
        "Every fairy and witch",
        "Every train whistle"
      ],
      "answer": "Every single sight or scene passed by the train",
      "explanation": "'Each' refers to all the previously mentioned sights (child, tramp, cart, mill, river) flashing by."
    },
    {
      "question": "Why are the sights 'gone forever'?",
      "options": [
        "The train crashes",
        "The train moves so fast that the specific fleeting moment can never be seen exactly the same way again",
        "The poet goes blind",
        "The sights are destroyed after the train passes"
      ],
      "answer": "The train moves so fast that the specific fleeting moment can never be seen exactly the same way again",
      "explanation": "The journey is continuous, and the rapid forward motion leaves the momentary sights permanently behind."
    },
    {
      "question": "What does the comparison 'charges along like troops in a battle' highlight about the train?",
      "options": [
        "Its violent aggression towards people",
        "Its fast, relentless, and powerful forward movement",
        "Its loud noise",
        "Its quiet and slow pace"
      ],
      "answer": "Its fast, relentless, and powerful forward movement",
      "explanation": "Like soldiers marching rapidly and forcefully into battle, the train moves with unstoppable momentum."
    },
    {
      "question": "Which word could best replace 'charges' while maintaining the poem's context of speed?",
      "options": [
        "Marches",
        "Pushes",
        "Rushes",
        "Crawls"
      ],
      "answer": "Rushes",
      "explanation": "Rushes best captures the high speed and suddenness described by the word 'charges' in this context."
    },
    {
      "question": "Why might the child need to 'clamber and scramble'?",
      "options": [
        "To hide from the train",
        "To cross a flat road",
        "To move through the prickly brambles on difficult, uneven ground",
        "To catch a butterfly"
      ],
      "answer": "To move through the prickly brambles on difficult, uneven ground",
      "explanation": "Gathering prickly brambles on a hill or ditch requires awkward and laborious climbing."
    },
    {
      "question": "What is the contrast presented between the train and the scenery outside?",
      "options": [
        "The train is silent, but the outside is loud",
        "The train's rhythm is regular and steady, but the outside view is constantly changing",
        "The train is slow, but the scenery is fast",
        "Both are completely still"
      ],
      "answer": "The train's rhythm is regular and steady, but the outside view is constantly changing",
      "explanation": "The poem's summary notes that the rhythm is regular and steady but the window view constantly changes."
    },
    {
      "question": "What is a simile?",
      "options": [
        "A word that sounds like what it means",
        "A figure of speech that directly compares two things using 'like' or 'as'",
        "A poem with exactly eleven words",
        "A rhyming pair of words"
      ],
      "answer": "A figure of speech that directly compares two things using 'like' or 'as'",
      "explanation": "The text states: 'A simile is a figure of speech that directly compares two things. Similes explicitly use connecting words such as ‘like’ and ‘as’.'"
    },
    {
      "question": "Which of these lines from the poem contains a simile?",
      "options": [
        "Faster than fairies, faster than witches",
        "And charging along like troops in a battle",
        "Here is a child who clambers and scrambles",
        "And there is the green for stringing the daisies"
      ],
      "answer": "And charging along like troops in a battle",
      "explanation": "This line uses the word 'like' to compare the train's movement to troops in a battle."
    },
    {
      "question": "Identify the rhyming pair found in the poem.",
      "options": [
        "Witches and Ditches",
        "Road and River",
        "Stations and Scrambles",
        "Fairies and Cattle"
      ],
      "answer": "Witches and Ditches",
      "explanation": "Witches and ditches rhyme at the end of the first two lines."
    },
    {
      "question": "Which of the following words rhyme in the poem?",
      "options": [
        "Battle and Cattle",
        "Eye and Rain",
        "Road and Brambles",
        "Mill and Forever"
      ],
      "answer": "Battle and Cattle",
      "explanation": "The poem uses 'battle' and 'cattle' as rhyming words at the end of lines 3 and 4."
    },
    {
      "question": "Vocabulary: 'I can help you to cross the river'. What noun from the poem am I?",
      "options": [
        "Train",
        "Bridge",
        "Cart",
        "Hedge"
      ],
      "answer": "Bridge",
      "explanation": "A bridge is a structure built to span a physical obstacle like a river."
    },
    {
      "question": "Vocabulary: 'I can border your garden'. What am I?",
      "options": [
        "Hedge",
        "Ditch",
        "River",
        "Meadow"
      ],
      "answer": "Hedge",
      "explanation": "A hedge is a boundary or border made of bushes or shrubs, commonly bordering gardens."
    },
    {
      "question": "Vocabulary: 'You can ride on me'. Which animal from the poem fits this?",
      "options": [
        "Fairies",
        "Cattle",
        "Horse",
        "Tramp"
      ],
      "answer": "Horse",
      "explanation": "Horses are animals mentioned in the poem that people can ride."
    },
    {
      "question": "Vocabulary: 'I can carry you'. Which word from the poem matches this?",
      "options": [
        "Cart",
        "Mill",
        "Station",
        "Ditch"
      ],
      "answer": "Cart",
      "explanation": "A cart is a vehicle designed for transport, carrying people or loads."
    },
    {
      "question": "In the Cinquain poem example provided, what are the adjectives in Line 2?",
      "options": [
        "Train, Procession",
        "Hooting, chugging",
        "Long, snaking",
        "Along, winding"
      ],
      "answer": "Long, snaking",
      "explanation": "The example gives 'long snaking' as the two adjectives describing the title."
    },
    {
      "question": "In the Cinquain poem example, which words are used to describe the action (verbs) in Line 3?",
      "options": [
        "Hooting, chugging, steaming",
        "Long, snaking, along",
        "Train, tracks, procession",
        "Winding, tracks, hooting"
      ],
      "answer": "Hooting, chugging, steaming",
      "explanation": "The verbs showing the action of the train in the example are 'hooting, chugging, steaming'."
    },
    {
      "question": "How does the rhythm of the poem contribute to its meaning?",
      "options": [
        "It makes the poem difficult to read",
        "It mimics the fast, rhythmic 'chug-chug' motion of a moving train",
        "It creates a sad and slow mood",
        "It sounds like a gentle lullaby"
      ],
      "answer": "It mimics the fast, rhythmic 'chug-chug' motion of a moving train",
      "explanation": "The strong, driving rhythm reflects the physical motion and speed of the train tracks."
    },
    {
      "question": "Why does the poet use the imagery of supernatural beings like fairies and witches in the first line?",
      "options": [
        "To show that the poem is a fairy tale",
        "To emphasize a speed that seems magical or impossible",
        "To scare children reading the poem",
        "To describe the passengers on the train"
      ],
      "answer": "To emphasize a speed that seems magical or impossible",
      "explanation": "Fairies and witches are known for magical flight; comparing the train to them highlights its extraordinary speed."
    },
    {
      "question": "What is the rule for the first line of a Cinquain poem according to the text?",
      "options": [
        "It must be a five-word sentence",
        "It must be a single word title, which is a noun",
        "It must contain three verbs",
        "It must rhyme with the last line"
      ],
      "answer": "It must be a single word title, which is a noun",
      "explanation": "The structure notes state: 'Line 1: A single word title -a noun'."
    },
    {
      "question": "According to the rules, what must the fourth line of a Cinquain poem describe?",
      "options": [
        "A feeling in a phrase of four words",
        "Two adjectives",
        "Three verbs",
        "A single noun"
      ],
      "answer": "A feeling in a phrase of four words",
      "explanation": "The text states: 'Line 4: Four words that describe a feeling in a phrase'."
    },
    {
      "question": "What is the total number of words required in a completed Cinquain poem?",
      "options": [
        "Five words",
        "Fifteen words",
        "Eleven words",
        "Twenty words"
      ],
      "answer": "Eleven words",
      "explanation": "The instructions clearly state: 'the finished poem should have only eleven words'."
    },
    {
      "question": "What does the 'tramp who stands and gazes' represent in the context of the poem?",
      "options": [
        "The danger of the railway tracks",
        "A moment of stillness contrasted against the rapid motion of the train",
        "The conductor of the train",
        "Someone waiting to board the train"
      ],
      "answer": "A moment of stillness contrasted against the rapid motion of the train",
      "explanation": "The tramp is stationary ('stands and gazes'), providing a sharp contrast to the speeding perspective of the passenger."
    },
    {
      "question": "How does the structure of the rhyming couplets (AABB) enhance the poem?",
      "options": [
        "It propels the reader forward quickly, matching the train's speed",
        "It makes the poem sound like free verse",
        "It stops the reader to ponder every word",
        "It breaks the rhythm of the poem"
      ],
      "answer": "It propels the reader forward quickly, matching the train's speed",
      "explanation": "The continuous rhyming couplets create a steady, rapid momentum that simulates a train ride."
    },
    {
      "question": "What overarching theme does 'Each a glimpse and gone forever' convey about human travel and life?",
      "options": [
        "Trains are dangerous to ride",
        "Life and journeys are full of fleeting moments that cannot be held onto",
        "People should take photographs to remember things",
        "It is better to walk than to ride a train"
      ],
      "answer": "Life and journeys are full of fleeting moments that cannot be held onto",
      "explanation": "The line serves as a metaphor for the transient nature of moments we witness as we move through life."
    },
    {
      "question": "Why is the metaphor 'thick as driving rain' highly effective in the poem?",
      "options": [
        "It implies that it is raining heavily outside",
        "It perfectly captures how individual sights blur together into one continuous stream at high speeds",
        "It shows that the train is waterproof",
        "It means the hill and plain are covered in water"
      ],
      "answer": "It perfectly captures how individual sights blur together into one continuous stream at high speeds",
      "explanation": "Just as heavy rain blurs individual drops into a sheet of water, the high speed blurs the scenery together."
    },
    {
      "question": "What is the primary sensory experience the poet tries to evoke in 'From A Railway Carriage'?",
      "options": [
        "Taste and smell of train food",
        "Visual speed and the rhythmic auditory sound of a train journey",
        "The feeling of cold wind",
        "The tactile sensation of brambles"
      ],
      "answer": "Visual speed and the rhythmic auditory sound of a train journey",
      "explanation": "The poem heavily relies on fast-paced visual imagery and rhythmic meter to make the reader see and hear the train ride."
    }
  ]
};

const transformedQuestions = data.quiz.map((q, idx) => {
  const letters = ['A', 'B', 'C', 'D'];
  const ansIdx = q.options.indexOf(q.answer);
  const ansLetter = letters[ansIdx] || "A";
  
  return {
    id: idx + 1,
    type: "mcq",
    question: q.question,
    options: q.options.map((opt, i) => `${letters[i]}) ${opt}`),
    answer: ansLetter,
    explanation: q.explanation
  };
});

const output = {
  title: "இரயில் வண்டியிலிருந்து (From A Railway Carriage - Poem) - மாதிரித் தேர்வு",
  subject: "english",
  className: "6",
  term: 2,
  lessonId: "eng_6_t2_l5",
  questions: transformedQuestions
};

fs.writeFileSync('eng_6_t2_l5_quiz.json', JSON.stringify(output, null, 2));
