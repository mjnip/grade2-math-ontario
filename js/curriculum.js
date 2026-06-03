/*
 * curriculum.js
 * Grade 2 Ontario Mathematics (2020) — content data.
 * Units mirror the five curriculum strands. Each unit has:
 *   - lessons:  teaching cards (Learn)
 *   - quiz:     graded practice questions (Practice)
 *   - homework: self-check problems (Homework)
 *
 * Question shapes:
 *   { type:'mc',  prompt, choices:[...], answer:<index>, explain }
 *   { type:'num', prompt, answer:<number|string>, explain }
 * For homework, `explain` is optional.
 */

const CURRICULUM = [
  /* =========================================================
   * UNIT 1 — NUMBER
   * =======================================================*/
  {
    id: 'number',
    title: 'Number',
    emoji: '🔢',
    colour: '#3b82f6',
    overall:
      'Read, represent, compose, and decompose whole numbers up to 200; count by 1s, 2s, 5s, 10s, and 25s; ' +
      'add and subtract numbers to 100; and understand fractions like one half and one fourth.',
    lessons: [
      {
        title: 'Numbers to 200',
        html: `
          <p>We can count all the way up to <strong>200</strong>! Numbers help us count things like
          stickers, steps, and snacks. 🍎</p>
          <p>Every number is made of <strong>digits</strong>. The number <strong>142</strong> has the
          digits 1, 4, and 2.</p>
          <div class="callout">Try counting out loud from 110 to 130. You've got this! 💪</div>`
      },
      {
        title: 'Place Value: Hundreds, Tens, Ones',
        html: `
          <p>Big numbers are made of <strong>hundreds</strong>, <strong>tens</strong>, and
          <strong>ones</strong>.</p>
          <p>Look at <strong>142</strong>:</p>
          <table class="place-value">
            <tr><th>Hundreds</th><th>Tens</th><th>Ones</th></tr>
            <tr><td>1</td><td>4</td><td>2</td></tr>
          </table>
          <p>That means <strong>1 hundred + 4 tens + 2 ones</strong> = 100 + 40 + 2 = <strong>142</strong>.</p>
          <div class="callout">The same digit can mean different amounts depending on where it sits!</div>`
      },
      {
        title: 'Skip Counting (2, 5, 10, 25)',
        html: `
          <p>Skip counting means counting in jumps instead of by 1. It's super fast! 🐰</p>
          <ul>
            <li><strong>By 2s:</strong> 2, 4, 6, 8, 10, 12…</li>
            <li><strong>By 5s:</strong> 5, 10, 15, 20, 25…</li>
            <li><strong>By 10s:</strong> 10, 20, 30, 40, 50…</li>
            <li><strong>By 25s:</strong> 25, 50, 75, 100… (just like quarters! 🪙)</li>
          </ul>
          <div class="callout">Counting by 2s helps you count things in pairs, like socks. 🧦</div>`
      },
      {
        title: 'Comparing & Ordering',
        html: `
          <p>We compare numbers to see which is <strong>bigger</strong> or <strong>smaller</strong>.</p>
          <ul>
            <li><strong>&gt;</strong> means <em>greater than</em> (the hungry mouth eats the bigger number!) 🐊</li>
            <li><strong>&lt;</strong> means <em>less than</em></li>
            <li><strong>=</strong> means <em>equal to</em></li>
          </ul>
          <p>Example: 87 <strong>&gt;</strong> 78, and 45 <strong>&lt;</strong> 54.</p>`
      },
      {
        title: 'Adding & Subtracting to 100',
        html: `
          <p><strong>Addition</strong> means putting amounts together. ➕</p>
          <p>23 + 14: add the ones (3 + 4 = 7), add the tens (20 + 10 = 30) → <strong>37</strong>.</p>
          <p><strong>Subtraction</strong> means taking away. ➖</p>
          <p>58 − 20: take 2 tens away from 5 tens → <strong>38</strong>.</p>
          <div class="callout">Addition and subtraction are opposites. They undo each other!</div>`
      },
      {
        title: 'Fractions: Halves & Fourths',
        html: `
          <p>A <strong>fraction</strong> is an equal part of a whole. 🍕</p>
          <ul>
            <li><strong>One half (½)</strong> = 1 of 2 equal parts.</li>
            <li><strong>One fourth (¼)</strong> = 1 of 4 equal parts (also called a quarter).</li>
          </ul>
          <p>If you cut a pizza into 2 equal slices, each slice is <strong>one half</strong>.</p>
          <div class="callout">The parts must be <em>equal</em> to be fair fractions!</div>`
      }
    ],
    quiz: [
      { type: 'num', prompt: 'In the number 142, what digit is in the tens place?', answer: 4,
        explain: 'Hundreds = 1, Tens = 4, Ones = 2.' },
      { type: 'mc', prompt: 'Skip count by 5s. What comes next? 5, 10, 15, 20, ___',
        choices: ['21', '25', '30', '50'], answer: 1, explain: '20 + 5 = 25.' },
      { type: 'mc', prompt: 'Which sign makes it true?   87 ___ 78',
        choices: ['<', '>', '='], answer: 1, explain: '87 is greater than 78, so we use >.' },
      { type: 'num', prompt: 'What is 23 + 14?', answer: 37, explain: '20+10=30 and 3+4=7, so 37.' },
      { type: 'num', prompt: 'What is 58 − 20?', answer: 38, explain: 'Take 2 tens from 58 → 38.' },
      { type: 'mc', prompt: 'A pizza is cut into 4 equal slices. One slice is…',
        choices: ['one half', 'one fourth', 'one whole'], answer: 1, explain: '1 of 4 equal parts = one fourth (¼).' },
      { type: 'mc', prompt: 'Count by 25s: 25, 50, 75, ___',
        choices: ['80', '90', '100', '125'], answer: 2, explain: '75 + 25 = 100.' },
      { type: 'num', prompt: 'How many tens are in the number 90?', answer: 9, explain: '9 tens = 90.' }
    ],
    homework: [
      { type: 'num', prompt: 'Write the number that is 1 hundred, 3 tens, and 6 ones.', answer: 136 },
      { type: 'num', prompt: 'Skip count by 10s: 30, 40, 50, ___', answer: 60 },
      { type: 'mc', prompt: 'Which number is the greatest?', choices: ['119', '191', '109'], answer: 1 },
      { type: 'num', prompt: 'Add: 45 + 30 = ?', answer: 75 },
      { type: 'num', prompt: 'Subtract: 67 − 5 = ?', answer: 62 },
      { type: 'mc', prompt: 'Half of a chocolate bar with 2 equal pieces is…',
        choices: ['1 piece', '2 pieces'], answer: 0 }
    ]
  },

  /* =========================================================
   * UNIT 2 — ALGEBRA
   * =======================================================*/
  {
    id: 'algebra',
    title: 'Algebra',
    emoji: '🔁',
    colour: '#a855f7',
    overall:
      'Identify, describe, extend, and create repeating, growing, and shrinking patterns; ' +
      'and understand equality, the equal sign, and simple equations.',
    lessons: [
      {
        title: 'Repeating Patterns',
        html: `
          <p>A <strong>repeating pattern</strong> uses a part that repeats over and over. 🔁</p>
          <p>🔴🔵🔴🔵🔴🔵 — the part that repeats is 🔴🔵 (we call it the <strong>core</strong>).</p>
          <p>Patterns can be made of colours, shapes, sounds, or movements (clap, stomp, clap, stomp!).</p>`
      },
      {
        title: 'Growing & Shrinking Patterns',
        html: `
          <p>A <strong>growing pattern</strong> gets bigger each time. 📈</p>
          <p>2, 4, 6, 8… (we add 2 each time).</p>
          <p>A <strong>shrinking pattern</strong> gets smaller each time. 📉</p>
          <p>20, 15, 10, 5… (we take away 5 each time).</p>
          <div class="callout">Find the <em>rule</em>: what changes from one step to the next?</div>`
      },
      {
        title: 'Equality & the Equal Sign',
        html: `
          <p>The <strong>equal sign (=)</strong> means both sides are the <strong>same</strong>. ⚖️</p>
          <p>Think of a balance scale. 4 + 1 <strong>=</strong> 2 + 3 because both sides make 5.</p>
          <div class="callout">= does NOT mean "the answer is". It means "the same as"!</div>`
      },
      {
        title: 'Finding the Missing Number',
        html: `
          <p>Sometimes a number is hidden. We find it to keep both sides equal.</p>
          <p>3 + ☐ = 7. What is ☐? Count up from 3 to 7… it's <strong>4</strong>!</p>
          <p>Check: 3 + 4 = 7. ✅</p>`
      }
    ],
    quiz: [
      { type: 'mc', prompt: 'What comes next?  🔺⭐🔺⭐🔺___',
        choices: ['🔺', '⭐', '🔵'], answer: 1, explain: 'The core is 🔺⭐, so a star comes next.' },
      { type: 'num', prompt: 'Growing pattern: 5, 10, 15, 20, ___', answer: 25,
        explain: 'We add 5 each time: 20 + 5 = 25.' },
      { type: 'num', prompt: 'Shrinking pattern: 18, 15, 12, ___', answer: 9,
        explain: 'We take away 3 each time: 12 − 3 = 9.' },
      { type: 'mc', prompt: 'Which makes the scale balanced?   4 + 2 = ___ + 1',
        choices: ['3', '4', '5'], answer: 2, explain: '4 + 2 = 6, and 5 + 1 = 6. So the answer is 5.' },
      { type: 'num', prompt: 'Find the missing number: 3 + ☐ = 9', answer: 6, explain: '3 + 6 = 9.' },
      { type: 'mc', prompt: 'What is the rule?  2, 4, 6, 8',
        choices: ['add 1', 'add 2', 'take away 2'], answer: 1, explain: 'Each number is 2 more than the last.' },
      { type: 'num', prompt: 'Find the missing number: 10 = 7 + ☐', answer: 3, explain: '7 + 3 = 10.' }
    ],
    homework: [
      { type: 'mc', prompt: 'Find the core (repeating part): 🟩🟨🟩🟨🟩🟨',
        choices: ['🟩', '🟩🟨', '🟨🟨'], answer: 1 },
      { type: 'num', prompt: 'Continue the growing pattern: 3, 6, 9, ___', answer: 12 },
      { type: 'num', prompt: 'Continue the shrinking pattern: 25, 20, 15, ___', answer: 10 },
      { type: 'num', prompt: 'Missing number: 5 + ☐ = 8', answer: 3 },
      { type: 'mc', prompt: 'Is this true?  2 + 4 = 3 + 3', choices: ['Yes', 'No'], answer: 0 },
      { type: 'num', prompt: 'Missing number: ☐ + 6 = 10', answer: 4 }
    ]
  },

  /* =========================================================
   * UNIT 3 — DATA
   * =======================================================*/
  {
    id: 'data',
    title: 'Data',
    emoji: '📊',
    colour: '#22c55e',
    overall:
      'Collect, organize, and display data using tally charts, pictographs, and bar graphs; ' +
      'read and interpret data; and describe the likelihood of events.',
    lessons: [
      {
        title: 'Collecting Data with Tally Marks',
        html: `
          <p><strong>Data</strong> is information we collect, like favourite colours. 🎨</p>
          <p>We use <strong>tally marks</strong> to count. Every 5th mark crosses the others:</p>
          <p style="font-size:1.4rem">| | | |  then  &#x0336;|||| (that's 5)</p>
          <p>So 7 looks like: ＝||||  ||  → a group of 5 and 2 more.</p>`
      },
      {
        title: 'Pictographs',
        html: `
          <p>A <strong>pictograph</strong> uses pictures to show data. 🖼️</p>
          <p>If 🍎 = 1 apple, then 🍎🍎🍎 means <strong>3 apples</strong>.</p>
          <div class="callout">Always check the key — sometimes 1 picture means 2 things!</div>`
      },
      {
        title: 'Bar Graphs',
        html: `
          <p>A <strong>bar graph</strong> uses bars. The <strong>taller</strong> the bar, the more there is. 📊</p>
          <p>We read the number at the top of each bar to know the amount.</p>
          <p>The tallest bar is the <strong>most popular</strong>; the shortest is the <strong>least</strong>.</p>`
      },
      {
        title: 'Probability: How Likely?',
        html: `
          <p><strong>Probability</strong> tells us how likely something is to happen. 🎲</p>
          <ul>
            <li><strong>Certain</strong> – it will definitely happen (the sun will set 🌅).</li>
            <li><strong>Likely</strong> – probably will happen.</li>
            <li><strong>Unlikely</strong> – probably won't.</li>
            <li><strong>Impossible</strong> – will never happen (a fish riding a bike 🐟🚲).</li>
          </ul>`
      }
    ],
    quiz: [
      { type: 'num', prompt: 'How many does this tally show?  ||||  ||  (a group of 5 and 2 more)', answer: 7,
        explain: '5 + 2 = 7.' },
      { type: 'mc', prompt: 'In a pictograph, 🍎 = 1 apple. How many is 🍎🍎🍎🍎🍎?',
        choices: ['4', '5', '10'], answer: 1, explain: 'Five apple pictures = 5 apples.' },
      { type: 'mc', prompt: 'On a bar graph, which bar shows the MOST?',
        choices: ['The shortest bar', 'The tallest bar', 'The thinnest bar'], answer: 1,
        explain: 'Taller bars mean larger amounts.' },
      { type: 'mc', prompt: 'How likely is it that a fish will ride a bicycle?',
        choices: ['Certain', 'Likely', 'Impossible'], answer: 2, explain: 'Fish cannot ride bikes — impossible!' },
      { type: 'mc', prompt: 'How likely is it to rain during a big rainstorm?',
        choices: ['Impossible', 'Unlikely', 'Likely'], answer: 2, explain: 'During a rainstorm, rain is likely.' },
      { type: 'num', prompt: 'A pictograph key says 🐶 = 2 dogs. 🐶🐶🐶 means how many dogs?', answer: 6,
        explain: '3 pictures × 2 = 6 dogs.' },
      { type: 'num', prompt: 'Tally for 10 is two groups of five. How many tens... how many marks in total?', answer: 10,
        explain: 'Two groups of 5 = 10.' }
    ],
    homework: [
      { type: 'num', prompt: 'Count the tally: a group of 5 and 3 more = ?', answer: 8 },
      { type: 'mc', prompt: 'A bar graph shows Cats=6, Dogs=4, Fish=2. Which pet is most popular?',
        choices: ['Cats', 'Dogs', 'Fish'], answer: 0 },
      { type: 'num', prompt: 'Pictograph: ⭐ = 1 star. How many is ⭐⭐⭐⭐⭐⭐?', answer: 6 },
      { type: 'mc', prompt: 'How likely is it that you will grow taller as you get older?',
        choices: ['Impossible', 'Likely', 'Unlikely'], answer: 1 },
      { type: 'mc', prompt: 'Which event is CERTAIN?',
        choices: ['Tomorrow will come', 'It will snow in summer', 'A cat will bark'], answer: 0 },
      { type: 'num', prompt: 'Key: 🍪 = 2 cookies. 🍪🍪🍪🍪 means how many cookies?', answer: 8 }
    ]
  },

  /* =========================================================
   * UNIT 4 — SPATIAL SENSE (Geometry & Measurement)
   * =======================================================*/
  {
    id: 'spatial',
    title: 'Spatial Sense',
    emoji: '📐',
    colour: '#f97316',
    overall:
      'Identify and describe 2D shapes and 3D objects and their properties; describe location and ' +
      'movement; and measure length, mass, capacity, area, time, and temperature using units.',
    lessons: [
      {
        title: '2D Shapes',
        html: `
          <p><strong>2D shapes</strong> are flat. They have <strong>sides</strong> and <strong>corners</strong> (vertices).</p>
          <ul>
            <li><strong>Triangle</strong> – 3 sides, 3 corners 🔺</li>
            <li><strong>Square</strong> – 4 equal sides, 4 corners 🟦</li>
            <li><strong>Rectangle</strong> – 4 sides (2 long, 2 short)</li>
            <li><strong>Circle</strong> – round, 0 sides, 0 corners ⚪</li>
          </ul>`
      },
      {
        title: '3D Solids',
        html: `
          <p><strong>3D solids</strong> are not flat — you can hold them! They have
          <strong>faces</strong>, <strong>edges</strong>, and <strong>vertices</strong>.</p>
          <ul>
            <li><strong>Cube</strong> – 6 square faces (like a dice 🎲)</li>
            <li><strong>Sphere</strong> – perfectly round (like a ball ⚽)</li>
            <li><strong>Cylinder</strong> – like a can 🥫</li>
            <li><strong>Cone</strong> – like an ice cream cone 🍦</li>
          </ul>`
      },
      {
        title: 'Location & Movement',
        html: `
          <p>We describe where things are using <strong>position words</strong>:</p>
          <p><strong>left, right, above, below, beside, between, in front of, behind.</strong></p>
          <p>Movement words: turn <strong>left</strong>, turn <strong>right</strong>, go
          <strong>forward</strong>. These help us follow a map! 🗺️</p>`
      },
      {
        title: 'Measuring Length',
        html: `
          <p>We measure how long things are. 📏</p>
          <ul>
            <li><strong>Centimetres (cm)</strong> for small things (a crayon).</li>
            <li><strong>Metres (m)</strong> for big things (a classroom). 1 m = 100 cm.</li>
          </ul>
          <div class="callout">Line up the ruler at 0 before you measure!</div>`
      },
      {
        title: 'Time & Temperature',
        html: `
          <p><strong>Time:</strong> a clock has an hour hand (short) and a minute hand (long). ⏰
          We can tell time to the hour and half-hour.</p>
          <p><strong>Temperature:</strong> we use a thermometer. 🌡️ Hot days are a high number;
          cold days are a low number (or below 0 in winter ❄️).</p>`
      }
    ],
    quiz: [
      { type: 'num', prompt: 'How many sides does a triangle have?', answer: 3, explain: 'Tri = three sides.' },
      { type: 'mc', prompt: 'Which shape is perfectly round with no corners?',
        choices: ['Square', 'Circle', 'Triangle'], answer: 1, explain: 'A circle has no sides or corners.' },
      { type: 'mc', prompt: 'A dice (number cube) is which 3D solid?',
        choices: ['Sphere', 'Cube', 'Cone'], answer: 1, explain: 'A cube has 6 square faces.' },
      { type: 'num', prompt: 'How many faces does a cube have?', answer: 6, explain: 'A cube has 6 faces.' },
      { type: 'mc', prompt: 'You would measure the length of a crayon in…',
        choices: ['metres', 'centimetres'], answer: 1, explain: 'Small objects are measured in cm.' },
      { type: 'num', prompt: 'How many centimetres are in 1 metre?', answer: 100, explain: '1 m = 100 cm.' },
      { type: 'mc', prompt: 'On a clock, the LONG hand points to the…',
        choices: ['hours', 'minutes'], answer: 1, explain: 'The long hand shows minutes.' },
      { type: 'mc', prompt: 'Which would be a COLD temperature?',
        choices: ['30°C in summer', '2°C in winter'], answer: 1, explain: 'A low number means cold.' }
    ],
    homework: [
      { type: 'num', prompt: 'How many corners (vertices) does a square have?', answer: 4 },
      { type: 'mc', prompt: 'An ice cream cone is shaped like a…', choices: ['cube', 'cone', 'sphere'], answer: 1 },
      { type: 'mc', prompt: 'A soccer ball is shaped like a…', choices: ['sphere', 'cylinder', 'cube'], answer: 0 },
      { type: 'mc', prompt: 'You would measure how long the gym is in…',
        choices: ['centimetres', 'metres'], answer: 1 },
      { type: 'num', prompt: 'A rectangle has how many sides?', answer: 4 },
      { type: 'mc', prompt: 'The cup is ___ the table.', choices: ['on', 'inside'], answer: 0 }
    ]
  },

  /* =========================================================
   * UNIT 5 — FINANCIAL LITERACY
   * =======================================================*/
  {
    id: 'money',
    title: 'Financial Literacy',
    emoji: '💰',
    colour: '#eab308',
    overall:
      'Identify Canadian coins and bills and their values, count and represent money amounts, ' +
      'and make simple decisions about spending and saving.',
    lessons: [
      {
        title: 'Canadian Coins',
        html: `
          <p>Canada uses these coins: 🪙</p>
          <ul>
            <li><strong>Nickel</strong> = 5¢</li>
            <li><strong>Dime</strong> = 10¢ (small but worth more than a nickel!)</li>
            <li><strong>Quarter</strong> = 25¢</li>
            <li><strong>Loonie</strong> = $1 (100¢) 🦆</li>
            <li><strong>Toonie</strong> = $2 (200¢)</li>
          </ul>
          <div class="callout">Size doesn't equal value — a dime is small but beats a nickel!</div>`
      },
      {
        title: 'Counting Money',
        html: `
          <p>To count money, start with the <strong>biggest</strong> coin and add as you go.</p>
          <p>A quarter + a dime + a nickel = 25¢ + 10¢ + 5¢ = <strong>40¢</strong>.</p>
          <p>Counting quarters is like skip counting by 25: 25, 50, 75, 100! 🪙🪙🪙🪙 = $1.</p>`
      },
      {
        title: 'Making an Amount',
        html: `
          <p>There are many ways to make the same amount! 💡</p>
          <p>To make <strong>10¢</strong>:</p>
          <ul>
            <li>1 dime (10¢), OR</li>
            <li>2 nickels (5¢ + 5¢)</li>
          </ul>
          <p>To make <strong>25¢</strong>: 1 quarter, OR 2 dimes + 1 nickel.</p>`
      },
      {
        title: 'Spending & Saving',
        html: `
          <p>Money can be <strong>spent</strong> now or <strong>saved</strong> for later. 🐷</p>
          <p>If a toy costs 50¢ and you have 75¢, you can buy it and have
          <strong>25¢ left over</strong> (75 − 50 = 25).</p>
          <div class="callout">Saving a little now lets you buy something bigger later!</div>`
      }
    ],
    quiz: [
      { type: 'num', prompt: 'How many cents is a quarter worth?', answer: 25, explain: 'A quarter = 25¢.' },
      { type: 'mc', prompt: 'Which coin is worth the MOST?',
        choices: ['Nickel', 'Dime', 'Quarter'], answer: 2, explain: 'A quarter (25¢) beats a dime (10¢) and nickel (5¢).' },
      { type: 'num', prompt: 'A dime + a nickel = how many cents?', answer: 15, explain: '10¢ + 5¢ = 15¢.' },
      { type: 'num', prompt: 'How many cents is a loonie ($1)?', answer: 100, explain: '$1 = 100¢.' },
      { type: 'num', prompt: 'Count: quarter + quarter = ? cents', answer: 50, explain: '25¢ + 25¢ = 50¢.' },
      { type: 'mc', prompt: 'Which makes 10¢?',
        choices: ['2 nickels', '2 dimes', '1 quarter'], answer: 0, explain: '5¢ + 5¢ = 10¢.' },
      { type: 'num', prompt: 'You have 75¢ and spend 50¢. How many cents are left?', answer: 25,
        explain: '75 − 50 = 25¢.' },
      { type: 'num', prompt: 'How many cents is a toonie ($2)?', answer: 200, explain: '$2 = 200¢.' }
    ],
    homework: [
      { type: 'num', prompt: 'A nickel is worth how many cents?', answer: 5 },
      { type: 'num', prompt: 'Quarter + dime = ? cents', answer: 35 },
      { type: 'mc', prompt: 'Which is the best way to make 25¢?',
        choices: ['1 quarter', '6 nickels', '3 dimes'], answer: 0 },
      { type: 'num', prompt: '4 quarters make how many cents?', answer: 100 },
      { type: 'num', prompt: 'You have 60¢ and buy a sticker for 40¢. How many cents are left?', answer: 20 },
      { type: 'mc', prompt: 'Putting money in a piggy bank for later is called…',
        choices: ['spending', 'saving'], answer: 1 }
    ]
  }
];

// Expose globally for the non-module scripts.
window.CURRICULUM = CURRICULUM;
