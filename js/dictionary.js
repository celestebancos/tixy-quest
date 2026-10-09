// The JavaScript dictionary. Each entry can have live examples.

export const SECTIONS = [
  {
    title: 'The four magic letters',
    entries: [
      { id: 't', term: 't', title: 'Time',
        body: `How many seconds since the pattern started. It keeps going up: 0, 0.1, 0.2 ... 1.5 ... 10 ... Use it to make things move!<br><br><code>t*2</code> is twice as fast. <code>t/2</code> is half as fast.`,
        examples: ['sin(t)', 'x==floor(t)%8', 'i<t*8'] },
      { id: 'i', term: 'i', title: 'Dot number',
        body: `Every dot has a number, like reading a book: start at the top left with 0, go across the row, then continue on the next row. On an 8×8 grid, <code>i</code> goes from 0 to 63.<br><br>The secret formula: <code>i = y*8 + x</code>`,
        examples: ['i<10', 'i==9', 'i%9==0'] },
      { id: 'x', term: 'x', title: 'Column number',
        body: `Which column the dot is in, counting from the left. The first column is <b>0</b>, not 1! On an 8×8 grid, <code>x</code> goes from 0 to 7.`,
        examples: ['x==0', 'x==3', 'x<4'] },
      { id: 'y', term: 'y', title: 'Row number',
        body: `Which row the dot is in, counting from the <b>top</b>. The top row is 0. Going down makes <code>y</code> bigger. (In maths class, y usually goes up. Computer screens are upside down!)`,
        examples: ['y==0', 'y==5', 'y>3'] },
    ],
  },
  {
    title: 'What makes a dot',
    entries: [
      { id: 'values', term: '1, 0, -1', title: 'Dot values',
        body: `Your code makes a number for each dot:<br>
          <code>1</code> (or <code>true</code>) = big white dot<br>
          <code>0</code> (or <code>false</code>) = no dot<br>
          <code>-1</code> = big red dot<br>
          <code>0.5</code> = half-size white dot<br>
          Anything bigger than 1 counts as 1, and anything smaller than -1 counts as -1.`,
        examples: ['1', '-1', '0.5', 'x/7', 'x-3'] },
      { id: 'truthy', term: 'truthy / falsy', title: 'Is it "on"?',
        body: `JavaScript treats some things like <code>false</code>: <code>0</code>, <code>false</code>, <code>NaN</code> and empty text <code>""</code>. These are <b>falsy</b>. Everything else is <b>truthy</b>, like <code>1</code>, <code>7</code>, <code>-3</code> and <code>true</code>.<br><br>That's why <code>x%2</code> works by itself: the remainder is 0 (falsy) or 1 (truthy).`,
        examples: ['x%2', 'x', '!x'] },
    ],
  },
  {
    title: 'Comparing',
    entries: [
      { id: 'equals', term: '==', title: 'Is equal to',
        body: `<code>x==3</code> asks "is x equal to 3?" and the answer is <code>true</code> or <code>false</code>.<br><br>Use two equals signs! One equals sign <code>=</code> means "put this value in a box", which is something different.`,
        examples: ['x==3', 'x==y', 'i==20'] },
      { id: 'notequals', term: '!=', title: 'Is NOT equal to',
        body: `<code>x!=3</code> is true for every column except column 3.`,
        examples: ['x!=3', 'x!=y'] },
      { id: 'compare', term: '< > <= >=', title: 'Bigger and smaller',
        body: `<code>x&lt;3</code> means "x is less than 3" (0, 1, 2).<br><code>x&lt;=3</code> means "less than OR equal to 3" (0, 1, 2, 3).<br><code>x&gt;3</code> means "greater than 3".<br><br>Trick to remember: the pointy end points at the smaller number. The open mouth eats the bigger one.`,
        examples: ['x<3', 'x<=3', 'x>y', 'x+y<8'] },
    ],
  },
  {
    title: 'Combining',
    entries: [
      { id: 'or', term: '||', title: 'Or',
        body: `<code>a||b</code> is true if <code>a</code> is true, OR <code>b</code> is true, or both.<br><br><b>Secret power:</b> <code>||</code> actually gives you back the first truthy thing, or the last thing if nothing is truthy. So <code>false||-1</code> gives <code>-1</code>. That's how <code>y&lt;4||-1</code> makes red dots!`,
        examples: ['x==0||y==0', 'x==2||x==5', 'y<4||-1'] },
      { id: 'and', term: '&&', title: 'And',
        body: `<code>a&&b</code> is true only if <code>a</code> AND <code>b</code> are both true.<br><br><b>Secret power:</b> <code>&&</code> gives you back the first falsy thing, or the last thing if everything is truthy.`,
        examples: ['x>2&&y>2', 'x==y&&x<4', 'x%2&&y%2'] },
      { id: 'not', term: '!', title: 'Not',
        body: `<code>!</code> flips true and false. <code>!true</code> is <code>false</code>. <code>!0</code> is <code>true</code>. <code>!5</code> is <code>false</code>.<br><br>Usually you need brackets: <code>!(x&lt;3)</code>.`,
        examples: ['!(x<3)', '!(x%3)', '!(x==y)'] },
      { id: 'brackets', term: '( )', title: 'Brackets',
        body: `Brackets mean "do this part first", just like in maths. <code>(x+y)%2</code> adds first, then does the remainder. <code>x+y%2</code> does the remainder of <code>y</code> first, then adds <code>x</code>.`,
        examples: ['(x+y)%2', 'x+y%2'] },
      { id: 'precedence', term: 'Order', title: 'Which goes first?',
        body: `Like × before + in maths, JavaScript has an order. From first to last:<br>
          1. <code>( )</code> brackets and functions like <code>abs()</code><br>
          2. <code>!</code> and minus signs like <code>-x</code><br>
          3. <code>**</code><br>
          4. <code>* / %</code><br>
          5. <code>+ -</code><br>
          6. <code>&lt;&lt; &gt;&gt;</code><br>
          7. <code>&lt; &gt; &lt;= &gt;=</code><br>
          8. <code>== !=</code><br>
          9. <code>&amp;</code> then <code>^</code> then <code>|</code><br>
          10. <code>&&</code> then <code>||</code><br>
          11. <code>? :</code><br><br>
          So <code>a||b&&c</code> means <code>a||(b&&c)</code>. When in doubt, add brackets!`,
        examples: ['x==1||x==6||x==y&&x>2', '(x==1||x==6||x==y)&&x>2'] },
      { id: 'ternary', term: '? :', title: 'Question mark choice',
        body: `<code>question ? yes : no</code><br><br>If the question is truthy, you get the "yes" part. Otherwise you get the "no" part. <code>x&lt;4 ? 1 : -1</code> gives white on the left and red on the right.<br><br>You can put one inside another: <code>y&lt;2 ? 1 : y&lt;5 ? -1 : 0.5</code>`,
        examples: ['x<4?1:-1', 'y<2?1:y<5?-1:0.5', '(x+y)%2?1:0.3'] },
      { id: 'includes', term: '[ ].includes()', title: 'Is it in the list?',
        body: `<code>[2,5,7]</code> is a list (programmers call it an <b>array</b>). <code>[2,5,7].includes(x)</code> asks "is x one of these numbers?"`,
        examples: ['[2,5,7].includes(x)', '[0,9,18,27].includes(i)', '[1,3].includes(x%4)'] },
    ],
  },
  {
    title: 'Maths',
    entries: [
      { id: 'arithmetic', term: '+ - * /', title: 'Plus, minus, times, divide',
        body: `Computers use <code>*</code> for times and <code>/</code> for divide. <code>x*2</code> is x times 2. <code>x/7</code> is x divided by 7.`,
        examples: ['x+y<8', 'x*y<10', 'x/7'] },
      { id: 'remainder', term: '%', title: 'Remainder',
        body: `<code>a%b</code> is what's left over after dividing a by b. <code>7%3</code> is 1 because 7 = 3+3+1.<br><br>Remainders count up and then wrap around back to 0, like a clock: <code>x%3</code> goes 0,1,2,0,1,2,0,1. That's why % is great for patterns that repeat!`,
        examples: ['x%3', 'x%3==0', '(x+y)%2', 'i%9==0'] },
      { id: 'power', term: '**', title: 'Power',
        body: `<code>a**2</code> means a×a ("a squared"). <code>2**3</code> is 2×2×2 = 8.`,
        examples: ['(x-3.5)**2+(y-3.5)**2<10'] },
      { id: 'abs', term: 'abs()', title: 'Absolute value',
        body: `<code>abs()</code> gets rid of the minus sign. <code>abs(-3)</code> is 3 and <code>abs(3)</code> is 3.<br><br>It's great for "how far apart": <code>abs(x-3.5)</code> is how far a dot is from the middle, whichever side it's on.`,
        examples: ['abs(x-3.5)<2', 'abs(x-y)<2', 'abs(x-3.5)+abs(y-3.5)<4'] },
      { id: 'minmax', term: 'min() max()', title: 'Smallest and biggest',
        body: `<code>min(4,9,2)</code> gives the smallest number: 2.<br><code>max(4,9,2)</code> gives the biggest: 9.<br><br><code>min(x,y,7-x,7-y)</code> is how far a dot is from the nearest edge of an 8×8 grid.`,
        examples: ['min(x,y)<2', 'max(x,y)<4', 'min(x,y,7-x,7-y)==1'] },
      { id: 'floor', term: 'floor() round() ceil()', title: 'Whole numbers',
        body: `<code>floor(2.7)</code> chops off the decimals: 2.<br><code>round(2.7)</code> goes to the nearest whole number: 3.<br><code>ceil(2.1)</code> always goes up: 3.<br><br><code>floor(x/2)</code> groups columns into pairs: 0,0,1,1,2,2,3,3.`,
        examples: ['floor(x/2)%2', 'x==floor(t)%8', 'y==round(t)%8'] },
      { id: 'hypot', term: 'hypot()', title: 'Straight-line distance',
        body: `<code>hypot(a,b)</code> is the length of the diagonal of a rectangle that is a wide and b tall. So <code>hypot(x-3.5,y-3.5)</code> is how far a dot is from the middle, measured with a ruler.<br><br>All the dots the same distance from the middle make a circle!`,
        examples: ['hypot(x-3.5,y-3.5)<3', 'hypot(x,y)<6', '1-hypot(x-3.5,y-3.5)/5'] },
      { id: 'sin', term: 'sin() cos()', title: 'Waves',
        body: `<code>sin()</code> and <code>cos()</code> make smooth waves that go up to 1 and down to -1, over and over. One full wave takes about 6.28 (that's 2×π).<br><br>Divide the inside to make waves wider: <code>sin(x/2)</code>. Add <code>t</code> to make them move: <code>sin(x+t)</code>.`,
        examples: ['sin(x)', 'sin(x/2)', 'cos(y)', 'sin(x+t)'] },
      { id: 'atan2', term: 'atan2()', title: 'Angle',
        body: `<code>atan2(a,b)</code> tells you the direction of a dot from a point, as an angle. It goes from -π to π (about -3.14 to 3.14), all the way around a circle.`,
        examples: ['atan2(x-3.5,y-3.5)/3.14', 'sin(atan2(x-3.5,y-3.5)*3+t)'] },
      { id: 'pi', term: 'PI', title: 'π',
        body: `<code>PI</code> is 3.14159... It's how many times the distance across a circle fits around the outside.`,
        examples: ['sin(x*PI/4)'] },
    ],
  },
  {
    title: 'Binary and bits (expert)',
    entries: [
      { id: 'binary', term: 'binary', title: 'Counting with 0 and 1',
        body: `Computers store every number using only 0s and 1s. Each place is worth double the one to its right: 1, 2, 4, 8, 16...<br><br>
          <code>5</code> = 4+1 = <code>101</code><br>
          <code>6</code> = 4+2 = <code>110</code><br>
          <code>7</code> = 4+2+1 = <code>111</code><br><br>Each 0 or 1 is called a <b>bit</b>. The inspector shows the binary for x and y when you click a dot.`,
        examples: ['x&1', 'x&2', 'x&4'] },
      { id: 'bitand', term: '&', title: 'Bitwise and',
        body: `One <code>&</code> (not two) compares the bits of two numbers and keeps only the bits that are 1 in <b>both</b>.<br><code>6&3</code>: <code>110 & 011 = 010</code>, which is 2.<br><br><code>x&1</code> checks if x is odd. <code>x&4</code> checks the 4s bit.`,
        examples: ['x&1', 'x&y', '!(x&y)'] },
      { id: 'bitor', term: '|', title: 'Bitwise or',
        body: `One <code>|</code> keeps the bits that are 1 in <b>either</b> number.<br><code>6|3</code>: <code>110 | 011 = 111</code>, which is 7.<br><br><code>t|0</code> is a shortcut for chopping off decimals.`,
        examples: ['(x|y)<4', '(x|y)%3'] },
      { id: 'xor', term: '^', title: 'Bitwise XOR',
        body: `<code>^</code> keeps the bits that are 1 in one number <b>or the other but not both</b>.<br><code>6^3</code>: <code>110 ^ 011 = 101</code>, which is 5.<br><br>Watch out: <code>^</code> is NOT "to the power of" in JavaScript. That's <code>**</code>.<br>Also, <code>&</code> happens before <code>^</code>, so <code>x^y&1</code> means <code>x^(y&1)</code>.`,
        examples: ['(x^y)&1', '!(x^y)', '(x^y)%5'] },
      { id: 'shift', term: '>> <<', title: 'Bit shift',
        body: `<code>&gt;&gt;</code> slides all the bits to the right, which is like dividing by 2 and chopping off the decimal.<br><code>13&gt;&gt;1</code>: <code>1101</code> → <code>110</code>, which is 6.<br><code>x&gt;&gt;2</code> is the same as <code>floor(x/4)</code>.<br><br><code>&lt;&lt;</code> slides left, which doubles.`,
        examples: ['x>>2==y>>2', '(x>>1)%2'] },
    ],
  },
]

export const ENTRIES = SECTIONS.flatMap(s => s.entries)

export function findEntry(id) {
  return ENTRIES.find(e => e.id === id)
}
