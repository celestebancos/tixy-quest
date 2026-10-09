// All the level packs.
//
// Each level:
//   code    the target pattern (the answer we know about)
//   size    grid size (default 8)
//   intro   text shown before the puzzle (HTML, use <code> for code)
//   hint    shown when "?" is pressed (true = show the answer)
//   outro   shown once solved, to explain the "why"
//   learn   dictionary entries this level uses (ids from dictionary.js)
//   alts    other known answers; the shortest one sets the "record to beat"
//   ways    how many different answers earn the "many ways" star (default 2)
//   starter code to put in the box at the start
//
// A level's id is its pack id + its code, so reordering levels keeps saved progress.

const mommy1 = [
  'i<6', 'y<1', 'i>8', 'i<45', 'i==9', 'i<11', 'i==61', 'i>48', 'x<4', 'x==3', 'i<56', 'x<3', 'i==0',
  'i==11', 'x>5', 'x==6', 'x==1', 'i>61', 'i<16', 'y==4', 'i==63', 'y==0', 'y<6', 'i<33', 'i<26', 'i<38',
  'x==7', 'i<61', 'i==22', 'y>0', 'x>1', 'i<19', 'i>17', 'x<1', 'y>3', 'x>0', 'y==7', 'y>4', 'x==5', 'y<10',
  'i==59', 'y<5', 'y<3', 'x<7', 'x==0', 'y>6', 'y==2', 'i<3', 'i==6', 'i==2', 'x>6', 'i==47', 'i>24',
  'i==56', 'i>0', 'x>3', 'y>7', 'i==31', 'i==15', 'y==3', 'x<5', 'i>39', 'y==6', 'i==5',
].map(code => ({ code }))

const mommy2 = [
  { code: 'x==2' },
  { code: 'x==7' },
  { code: 'x==2||x==7', intro: `Can you figure out how to do this one using <code>||</code>?`, learn: ['or'] },
  { code: 'x==2||x==4||x==7', intro: `How about this one?` },
  { code: 'y==1||y==3' },
  { code: 'y==1||y==3||y==5||y==7' },
  { code: 'x==4||y==4' },
  { code: 'x==0||y==0' },
  { code: 'x==7||y==5' },
  { code: 'x==0||y==0||y==3||y==7' },
  { code: 'x==0||y==0||y==3||x==7' },
  { code: 'x==0||x==7||y==0||y==7' },
  { code: 'x==3||y==3' },
  { code: 'x==1||x==6||y==1||y==6' },
  { code: 'x==5||y==1' },
  { code: 'x==5&&y==1', starter: 'x==5||y==1', intro: `What happens when you change the <code>||</code> to an <code>&&</code>?`, learn: ['and'] },
  { code: 'y==5&&x==1' },
  { code: 'i==6', starter: 'i==4' },
  { code: 'i==4||i==6' },
  { code: '(x==0&&y==0)||(x==7&&y==7)', starter: '(x==0||y==0)||(x==7||y==7)', hint: 'Try something like this but with some &&: (x==0||y==0)||(x==7||y==7)' },
  { code: 'x==0||x==7||x==y' },
]

// The original tutorial by @JakeGMaths at mathsuniverse.com: https://www.mathsuniverse.com/tixy
const tutorial = [
  { code: 'x==1', starter: 'x==5', learn: ['x'], intro: `Change the code below so your pattern on the left matches the example on the right. This first puzzle uses the parameter <code>x</code>, the column index.`, outro: `Great! Notice how although its the 2nd column, <code>x</code> is equal to 1, not 2. That's because rows and columns are zero-indexed - ie the first is 0 not 1.` },
  { code: 'y==6', learn: ['y'], intro: `This time you need <code>y</code> instead of <code>x</code>. In computer graphics, the origin (0, 0) is top-left rather than bottom-left, so <code>y</code> increases as you go down.`, outro: `The current grids are 8x8 in size. Later on, the grids get bigger. Because of zero-indexing, rows and columns go from 0 to 7.` },
  { code: 'i==9', learn: ['i'], hint: 'Try i==20 to start with then tweak away', intro: `Dots are indexed with <code>i</code>, starting from zero top-left and increasing to the bottom-right. Some challenges have hints - press '?' if stuck.`, outro: `With an 8x8 grid, <code>i</code> goes from 0 to 63 (1 less than 8x8=64). You can use parameters <code>x</code>, <code>y</code> and <code>i</code> in all puzzles, but won't need the last one <code>t</code> until later.` },
  { code: 'x>3', learn: ['compare'], hint: 'Start with x>1 then tweak away', intro: `Multiple rows, columns or consecutive dots can be turned on by creating an inequality using <code>&lt;</code> or <code>&gt;</code>.`, outro: `You can also use <code>&gt;=</code> and <code>&lt;=</code> for inequalities.` },
  { code: 'y>5', hint: 'Like last challenge, but with y', intro: `Not every challenge will have text before it, or after it when completed. You can always scroll back up to remind yourself how things work.` },
  { code: 'i>10', hint: 'An inequality involving i' },
  { code: 'x==y', hint: 'Think about x and y for each point', intro: `If unsure, play around and experiment and/or try thinking logically, for example about the coordinates of each white dot.` },
  { code: 'x>4&y<2', learn: ['and', 'or'], hint: 'Try 2 inequalities with && between', intro: `Puzzles may require more than one equation or inequality. Link them together with <code>&&</code> for 'and' or <code>||</code> for 'or'.` },
  { code: 'i<3|i>60', hint: '2 inequalities with || between' },
  { code: '[0,7,56,63].includes(i)', starter: '[5, 10, 30].includes(i)', learn: ['includes'], hint: 'Find numbers for [...].includes(i)', intro: `Puzzles can be solved in multiple ways. I suggest using <code>[...].includes(i)</code> for this one, but other ways will also work and get a tick.`, outro: `<code>[5,10,30].includes(i)</code> creates an array or list of numbers, then checks if <code>i</code> is in that list. Usually there's a more efficient way to solve the puzzles.` },
  { code: 'x==y|x+y==7', hint: 'Think about the x and y for each point', intro: `You've seen half of this cross before. You need to add an equation for the other half.` },
  { code: 'i%5', starter: 'i%3', learn: ['remainder', 'truthy'], intro: `Notice how every nth dot is blank? <code>i%3</code> gives the remainder when <code>i</code> is divided by 3, and dots are blank when that remainder is 0 (because 0 is 'falsy').`, outro: `When things repeat or wrap around, we're dealing with modulus or clock arithmetic - like how a clock wraps around after 60 minutes.` },
  { code: '!(i%3)', learn: ['not'], hint: '!(i%6) will turn on every 6th dot', intro: `The logical 'NOT' operator <code>!</code> can be used to toggle true/false to give the reverse of which dots are on. You'll also need brackets for this puzzle.`, outro: `Dots are on when your code evaluates to a truthy value, and blank when falsy. <code>true</code>, <code>1</code> and eg <code>2.5</code> are all truthy; <code>false</code> and <code>0</code> are falsy.` },
  { code: '-1', learn: ['values'], hint: 'For red, you need -1', intro: `Red?! Instead of thinking of true/false, actually each dot can be -1 for red, 0 for off and 1 (or true) for white.`, outro: `Behind the scenes, your code is run in a <code>function (t, i, x, y) { return yourCode }</code> for each dot. The evaluation of your code within this function turns dots off/white/red.` },
  { code: '-(y==3)', starter: '!(y==4)', intro: `If you negate/subtract 'true', you get -1, but if you <code>!</code> a truthy value, you get false.` },
  { code: '-(i==4)' },
  { code: 'i==0|-(i==1)', hint: '2 equations with ||, one negated' },
  { code: 'i%2|-!(i%2)', hint: 'Use remainders (%) and some negation' },
  { code: '(y<1|y>6|x<1|x>6)&&(i%2|-!(i%2))', hint: 'Add inequalities to last one' },
  { code: '-!(i%5)', hint: 'Every nth where n=...' },
  { code: '-!(i%5)|i==63' },
  { code: 'x==1|x==4|x==6&y>3|y==4&x>1&x<4|i==22', hint: 'Various lines and inequalities' },
  { code: 'x==1|x==4|x==6&y>3|y==4&x>1&x<4|-(i==22)', hint: 'Just negate one thing from last one' },
  { code: '0.5', hint: 'Just a number between 0 and 1', intro: `I lied. You can return any number between -1 and 1. Fractional values make the dots smaller.`, outro: `Values greater than 1 are treated as 1, and lower than -1 are treated as -1.` },
  { code: 'x/7', hint: 'Remember: zero-indexed', intro: `Graduated patterns can be created using simple division.`, outro: `We divide by 7 not 8 because <code>x</code> is 7 for the last column, and 7/7=1.` },
  { code: '(x+y)/14', hint: 'Both x and y are needed' },
  { code: '-y/7', hint: '-1 to 0 for red of various sizes' },
  { code: 'x-y', hint: 'A subtraction involving both x and y', intro: `All white dots here are 1 <em>or above</em>, and red dots -1 <em>or below</em>, because values are clamped between -1 and 1.`, outro: `Remember when you see a white dot, it could be because its 'true', 1, or any number more than 1.` },
  { code: '(x-y)/7', hint: 'Like last puzzle, with some division', intro: `The last puzzle had values outside -1 to 1 which still appeared as red or white. For this puzzle, you have to bring them all into that range yourself.` },
  { code: 'i/63', hint: `The index of the last dot is not 64` },
  { code: '2*i/63-1', hint: 'You probably need to double something', intro: `You need the first dot to be exactly -1 here, and the last one exactly 1.`, outro: `That was our last 8x8 grid. Our grid size is about to increase to 16x16 dots. Bear that in mind when making your calculations.` },
  { code: 'sin(x)', size: 16, learn: ['sin'], hint: 'Put a parameter inside sin()', intro: `The maths function <code>sin()</code> returns values waving between -1 and 1 for any numeric input, perfect for our needs!`, outro: `<code>sin()</code> waves repeats every 360° of input. But Javascript uses radians not degrees. 360° is 2π radians, so <code>sin(0)</code> is roughly equal to <code>sin(6.3)</code>.` },
  { code: 'sin(y/2)', size: 16, hint: 'Divide the input to sin() by an amount', intro: `We have 16 rows or columns, and 2π is a bit more than 6, so in the last puzzle the wave repeated ~2.5 times. Stretch a wave using division on its input.`, outro: `You can use all members of the Javascript <code>Math</code> global without the prefix - eg just <code>sin()</code> or <code>PI</code> instead of <code>Math.sin()</code> or <code>Math.PI</code>.` },
  { code: 'sin(i)', size: 16, hint: 'Try a wave on a different parameter', outro: `We get some really pretty patterns here! You'll notice the wave as you go from left to right along each row, but also where maxima and minima line up.` },
  { code: 'sin(i/4)', size: 16, intro: `Play around with different multiples and fractions of the input to <code>sin()</code>, and note its wavelength (distance between identical points).`, outro: `Other functions such as <code>cos()</code> and <code>tan()</code> are also available for you to play around with (but aren't needed for the puzzles).` },
  { code: 'x>7|i==5|i==20|i==32&&sin(i)', size: 16, hint: 'Add some equations and inequalities' },
  { code: 't/4', size: 16, learn: ['t'], hint: 'Divide t by something to slow it down', intro: `Introducing our fourth and final parameter, <code>t</code>, the time in seconds. Time restarts when you change code or press the restart button.`, outro: `Animations will run faster if you multiply <code>t</code> by something, and slower if you divide it.` },
  { code: 't-1', size: 16, hint: 'How can you make time start at -1?', intro: `If the animation seems static, press restart to reset time to zero. Think about what numbers you need for red, white and blank dots and the time taken.`, outro: `Notice how time keeps increasing but the dots stay white? Your code is returning values > 1 which are ignored and clamped to a maximum of 1.` },
  { code: 'sin(t)', size: 16, hint: 'What function do you know to make waves?', intro: `Animations are more fun if they go on forever.` },
  { code: 't-i', size: 16, hint: 'Values over 1 are treated as 1', intro: `We can create a basic clock using <code>t</code>, <code>i</code> and a simple mathematical operation.` },
  { code: '-(t*4-i)', size: 16, intro: `This clock is faster, and the colours are inverted.` },
  { code: 'sin(t+i)', size: 16, hint: 'Anything animated involves t', intro: `Patterns look much cooler when they're animated with <code>t</code> and a <code>sin()</code> wave!` },
  { code: 'sin(t+x)', size: 16, hint: 'Anything animated involves t' },
  { code: 'sin(x-y-t)', size: 16 },
  { code: 'i > round(t)', size: 16, learn: ['floor'], intro: `Sometimes we don't want fractional values. You can <code>round()</code> values to the nearest integers.` },
  { code: 'y==round(t)', size: 16 },
  { code: 'x - round(t)', size: 16 },
  { code: 'sin(t/50*i)', size: 32, hint: true, intro: `That's the end of the tutorial. From here on, there's a selection of cool animations on a 32x32 grid. Hit '?' to see the code for each one.` },
  { code: '1-((x*x-y+t*(1+x*x%5)*3)%16)/16', size: 32, hint: true, intro: `Copy+paste code from the hints then tweak away.` },
  { code: 'sin(-t*6/hypot(x-15.5,y-15.5))', size: 32, hint: true, intro: `Can you change the speed of this one? Or invert the colours?` },
  { code: '(((x-16)/y+t*3)&1^1/y*16&1)*y/10', size: 32, hint: true, intro: `Can you speed it up? Or slow it down?` },
  { code: 'sin(t-sqrt((x-15.5)**2+(y-15.5)**2))', size: 32, hint: true, intro: `How can you change where the centre of the ripple is? Or speed it up?` },
  { code: '1/32*tan(t/64*x*tan(i-x))', size: 32, hint: true },
  { code: 'i%(t/10)-0.5', size: 32, hint: true },
  { code: 'x%(t/2)-0.5+x/32', size: 32, hint: true },
  { code: 'cos(50*sin((y-15.5)/(x-15.5))+5*t)', size: 32, hint: true },
  { code: 'max(0, 0.1-t/10)', size: 32, intro: `Experiment and create cool stuff!` },
]

const shapes = [
  { code: 'x<=y', learn: ['compare'], alts: ['y>=x', 'x<y+1', '!(x>y)'],
    intro: `A triangle! Click on some dots to see their <code>x</code> and <code>y</code>. What do all the white dots have in common?`,
    outro: `Every dot on the diagonal has <code>x</code> equal to <code>y</code>. Below the diagonal, <code>y</code> is bigger.` },
  { code: 'x+y<8', alts: ['x+y<=7', 'y<8-x'],
    intro: `You can do maths before you compare. Try adding <code>x</code> and <code>y</code> together.`,
    outro: `Dots near the top-left corner have small <code>x</code> AND small <code>y</code>, so <code>x+y</code> is small.` },
  { code: 'abs(x-3.5)<1', learn: ['abs'], alts: ['x==3||x==4', 'x>2&&x<5', 'x>2&x<5'],
    intro: `The middle of an 8-wide grid is between column 3 and column 4, so it's at 3.5. <code>abs()</code> gets rid of minus signs, so <code>abs(x-3.5)</code> means "how far is this dot from the middle?"`,
    outro: `Columns 3 and 4 are both 0.5 away from the middle. Columns 2 and 5 are 1.5 away.` },
  { code: 'abs(x-3.5)<1||abs(y-3.5)<1', alts: ['x==3||x==4||y==3||y==4'],
    intro: `A plus sign. You can use the trick from the last level twice.` },
  { code: 'abs(x-y)<2', alts: ['x-y<2&&y-x<2', 'x-y<2&y-x<2'],
    intro: `A thick diagonal. <code>x-y</code> is 0 on the diagonal. How far away from 0 can it be?`,
    outro: `<code>abs(x-y)</code> is how far a dot is from the diagonal line.` },
  { code: 'abs(x-3.5)+abs(y-3.5)<4',
    intro: `A diamond! Add up how far across from the middle and how far down from the middle.`,
    outro: `This kind of distance is called "taxicab distance", because a taxi in a city with square blocks has to drive across and then down. It can't cut diagonally.` },
  { code: 'abs(x-3.5)+abs(y-3.5)==4', intro: `Now just the outline.` },
  { code: 'abs(x-3.5)<2&&abs(y-3.5)<2', alts: ['x>1&&x<6&&y>1&&y<6', 'max(abs(x-3.5),abs(y-3.5))<2', 'x>1&x<6&y>1&y<6'],
    intro: `A square in the middle. There are lots of ways to do this one.` },
  { code: 'max(abs(x-3.5),abs(y-3.5))==2.5', learn: ['minmax'], alts: ['min(x,y,7-x,7-y)==1'],
    intro: `<code>max(a,b)</code> gives you whichever number is bigger. If you take the bigger one of "how far across" and "how far down", you get square-shaped distance instead of diamond-shaped.`,
    outro: `Another way: <code>min(x,y,7-x,7-y)</code> is how far a dot is from the nearest edge. Click some dots and try it in the inspector!` },
  { code: '[0,2].includes(min(x,y,7-x,7-y))', learn: ['includes', 'minmax'], alts: ['min(x,y,7-x,7-y)%2==0', '!(min(x,y,7-x,7-y)%2)'],
    intro: `A square inside a square. Hint: <code>min(x,y,7-x,7-y)</code> tells you how many steps a dot is from the nearest edge.` },
  { code: 'abs(x-3.5)<=y/2+0.5', alts: ['abs(2*x-7)<=y+1', 'abs(x-3.5)*2<=y+1'],
    intro: `A stepped pyramid. Click a dot on each row and look at <code>abs(x-3.5)</code>. How does it compare to <code>y</code>?` },
  { code: 'x==1||x==6||x==y&&x>0&&x<7', learn: ['precedence'], alts: ['x==1||x==6||x==y&&x%7>0'],
    intro: `The letter N! Watch out: <code>&&</code> happens before <code>||</code>, just like × happens before + in maths.`,
    outro: `So <code>a||b&&c</code> means <code>a||(b&&c)</code>. You can always add brackets to make it clearer.` },
  { code: '[18,21,33,38].includes(i)||y==5&&x>1&&x<6',
    intro: `Make a smiley face! Click on the eyes to find out their <code>i</code> numbers.` },
]

const remainder = [
  { code: 'x%2', learn: ['remainder', 'truthy'], alts: ['x&1'],
    intro: `<code>%</code> gives the <b>remainder</b> after dividing. <code>5%2</code> is 1, because 5 = 2+2 with 1 left over. Click on dots to see what <code>x%2</code> is for each one.`,
    outro: `Even numbers have remainder 0 (no dot) and odd numbers have remainder 1 (dot).` },
  { code: 'y%2==0', alts: ['!(y%2)', '1-y%2', 'y%2<1'], intro: `Every other row, but starting at the top.` },
  { code: '(x+y)%2', alts: ['x+y&1', 'x%2^y%2', '(x^y)&1'], intro: `A checkerboard!`,
    outro: `When you move one step in any direction, <code>x+y</code> goes up or down by 1, so it flips between even and odd.` },
  { code: 'x%3==0', alts: ['!(x%3)', '[0,3,6].includes(x)'] },
  { code: 'x%3==0||y%3==0', alts: ['!(x%3)||!(y%3)', '!(x%3&&y%3)', '!(x%3)|!(y%3)'], intro: `A grid, like graph paper.` },
  { code: '(x+y)%3==0', alts: ['!((x+y)%3)'], intro: `Slanted stripes.` },
  { code: 'i%9==0', alts: ['x==y', '!(i%9)'],
    intro: `This one uses <code>i</code>, not <code>x</code> or <code>y</code>. Can you find a <code>%</code> that makes a diagonal?`,
    outro: `Why does <code>i%9</code> make a diagonal? Going down one row adds 8 to <code>i</code>. Going right one adds 1. So going diagonally adds 8+1 = 9!` },
  { code: 'i%7==0', alts: ['!(i%7)'],
    intro: `Weird! Use the trick from the last level. Going diagonally the other way adds 8-1...`,
    outro: `Why are the top-left and bottom-right corners on too? Because 0 and 63 are both multiples of 7 as well. 63 = 7×9.` },
  { code: 'x%4<2', alts: ['!(x&2)', '[0,1,4,5].includes(x)', 'x%4<=1'], intro: `Stripes that are 2 wide.` },
  { code: 'x%2==0&&y%2==0', alts: ['!(x%2||y%2)', '!(x%2+y%2)', '!((x|y)&1)', '!(x%2|y%2)'], intro: `Polka dots.` },
  { code: 'y%2==0||(x+y%4)%4==0', hint: 'Every other row is a full line. The other rows have a dot every 4.',
    intro: `A brick wall! Look closely at the rows in between the lines.` },
  { code: 'min(x,y,7-x,7-y)%2==0', learn: ['minmax'], alts: ['!(min(x,y,7-x,7-y)%2)', '[0,2].includes(min(x,y,7-x,7-y))'],
    intro: `Squares inside squares. Remember <code>min(x,y,7-x,7-y)</code> from the shapes pack?` },
  { code: '(floor(x/2)+floor(y/2))%2', learn: ['floor'], alts: ['(x&2)^(y&2)', '(x>>1^y>>1)&1', '(x^y)&2'],
    intro: `A checkerboard with bigger squares. <code>floor()</code> chops off the decimals: <code>floor(2.5)</code> is 2. So <code>floor(x/2)</code> is 0, 0, 1, 1, 2, 2, 3, 3.` },
  { code: 'x%4==0||y%4==0', size: 16, alts: ['!(x%4&&y%4)', '!(x%4)|!(y%4)'], intro: `A bigger grid. Same trick, bigger numbers.` },
  { code: 'x*y%5==0', size: 16, alts: ['!(x*y%5)'],
    intro: `A mystery pattern! It uses <code>x*y</code> and <code>%</code>.`,
    outro: `<code>x*y</code> is a multiple of 5 whenever <code>x</code> or <code>y</code> is a multiple of 5. That's why you get lines at 0, 5, 10 and 15.` },
]

const redWhite = [
  { code: 'y<4||-1', learn: ['or', 'values'], alts: ['y<4?1:-1', '(y<4)*2-1', 'y>3?-1:1'],
    intro: `Top half white, bottom half red. Here's a secret: <code>a||b</code> gives you <code>a</code> if <code>a</code> is truthy, otherwise it gives you <code>b</code>. So <code>false||-1</code> is -1!`,
    outro: `This is the flag of Poland 🇵🇱` },
  { code: 'x<4?-1:1', learn: ['ternary'], alts: ['x>3||-1', 'x>3?1:-1'],
    intro: `Another way to choose: <code>question ? yes : no</code>. Try <code>x&lt;4 ? 1 : -1</code> and see what happens, then fix it.` },
  { code: '(x+y)%2||-1', alts: ['(x+y)%2*2-1', '(x+y)%2?1:-1', 'x+y&1||-1'], intro: `A red and white checkerboard.` },
  { code: 'x==2||y==3||-1', alts: ['x==2|y==3||-1'], intro: `A white cross on red. Kind of like the flag of Denmark 🇩🇰` },
  { code: 'x==y||x+y==7?-1:1', learn: ['precedence'], alts: ['x==y|x+y==7?-1:1'],
    intro: `A red X on white.`,
    outro: `<code>? :</code> happens last of all, so <code>a||b?-1:1</code> means <code>(a||b)?-1:1</code>.` },
  { code: 'y<4?-(abs(x-3.5)<y+1):x%7&&(y<6||abs(x-3.5)>1)', hint: 'y<4 ? (the roof) : (the walls and door)',
    intro: `A house with a red roof. Do the roof and the bottom part separately with <code>? :</code>` },
  { code: 'min(x,y,7-x,7-y)%2||-1', alts: ['min(x,y,7-x,7-y)%2*2-1'], intro: `Red and white frames.` },
  { code: 'x%7&&y%7?max(abs(x-3.5),abs(y-3.5))>1:-1', hint: 'Red edge, white inside, empty middle. Try ? : with another ? : inside.',
    alts: ['x%7&&y%7?min(x,y,7-x,7-y)<3:-1'],
    intro: `Three things this time: red, white AND empty.`,
    outro: `<code>x%7</code> is 0 only when <code>x</code> is 0 or 7, so <code>x%7&&y%7</code> is falsy right on the edge.` },
  { code: '(abs(x-7.5)<2&&abs(y-7.5)<6)||(abs(y-7.5)<2&&abs(x-7.5)<6)||-1', size: 16, intro: `The flag of Switzerland 🇨🇭 on a bigger grid.` },
  { code: '-(y?abs(x-3.5)<6-y:abs(abs(x-3.5)-2)<1)', alts: ['-(y?abs(x-3.5)<6-y:x%4%3>0)', '-(y?abs(x-3.5)<6-y:x%4==1||x%4==2)'],
    hint: 'The top row is special. Use y ? (all other rows) : (top row)',
    intro: `A red heart ❤️. This one is hard! Every row except the top one gets narrower as you go down.` },
  { code: 'hypot(x-7.5,y-7.5)<8&&(floor(hypot(x-7.5,y-7.5)/2)%2||-1)', size: 16, learn: ['hypot', 'floor'],
    hint: 'hypot(x-7.5,y-7.5) is the distance from the middle. Make rings 2 wide.',
    intro: `A target 🎯! <code>hypot(a,b)</code> gives the straight-line distance, like a ruler.` },
]

const shading = [
  { code: 'y/7', alts: ['y/7'], intro: `Dots can be different sizes. 1 is a full dot and 0.5 is half size.` },
  { code: '1-x/7', alts: ['(7-x)/7'], intro: `Big on the left, shrinking to nothing.` },
  { code: 'abs(x-3.5)/3.5', learn: ['abs'], intro: `Small in the middle, big on the edges.` },
  { code: 'x*y/49', intro: `Biggest in the bottom right corner.`, outro: `7×7 = 49, so the corner is exactly 1.` },
  { code: '1-hypot(x-3.5,y-3.5)/5', learn: ['hypot'], intro: `A glowing light in the middle.` },
  { code: '(x+y)%2?1:0.4', alts: ['(x+y)%2||0.4'], intro: `A checkerboard of big and small dots.` },
  { code: 'x/7*2-1', alts: ['(2*x-7)/7', '2*x/7-1'], intro: `From big red, to nothing, to big white.` },
  { code: 'y%2?1-x/7:x/7', hint: 'Odd rows and even rows go in different directions', alts: ['y%2?(7-x)/7:x/7'],
    intro: `A snake! It goes right on one row, then left on the next.` },
  { code: 'sin(x/2)*cos(y/2)', size: 16, learn: ['sin'], intro: `An egg carton. Multiply two waves together.` },
  { code: 'cos(hypot(x-7.5,y-7.5))', size: 16, learn: ['sin', 'hypot'], intro: `Ripples in a pond.` },
]

const big = [
  { code: 'hypot(x-7.5,y-7.5)<6', size: 16, learn: ['hypot'], alts: ['(x-7.5)**2+(y-7.5)**2<36'],
    intro: `A circle! <code>hypot(a,b)</code> measures the straight-line distance. The middle of a 16-wide grid is 7.5.`,
    outro: `A circle is all the points that are the same distance from the middle. So "less than 6 away" fills it in.` },
  { code: 'abs(hypot(x-7.5,y-7.5)-6)<1', size: 16, intro: `Now just the outline of the circle.` },
  { code: 'x==y||x+y==15', size: 16, alts: ['x==y|x+y==15', '!(x-y)|x+y==15'] },
  { code: '(floor(x/4)+floor(y/4))%2', size: 16, learn: ['floor'], alts: ['(x^y)&4', '(x>>2)+(y>>2)&1'], intro: `A checkerboard with 4×4 squares.` },
  { code: 'hypot(x-7.5,y-7.5)<7&&hypot(x-11,y-5)>6.5', size: 16, intro: `A moon 🌙. Start with a circle, then take a bite out of it with another circle.` },
  { code: 'floor(hypot(x-7.5,y-7.5))%3==0', size: 16, intro: `Rings. Use the distance from the middle and a <code>%</code>.` },
  { code: '(x-7.5)**2/49+(y-7.5)**2/16<1', size: 16, learn: ['power'], hint: 'Like a circle, but squashed: divide the up-down part by a smaller number',
    alts: ['hypot((x-7.5)/7,(y-7.5)/4)<1'], intro: `An oval. <code>a**2</code> means a×a.` },
  { code: 'abs(y-7.5-5*sin(x/2.5))<1.2', size: 16, learn: ['sin'], intro: `A wavy line. <code>sin()</code> makes waves that go between -1 and 1. How tall is this wave?` },
  { code: 'x>>2<=y>>2', size: 16, learn: ['shift', 'floor'], alts: ['floor(x/4)<=floor(y/4)'], intro: `Big stairs. Each step is 4 dots wide.` },
  { code: 'abs(hypot(x-7.5,y-7.5)-7)<0.7||hypot(abs(x-7.5)-3,y-5)<1.2||y>9&&y<11&&abs(x-7.5)<4', size: 16,
    hint: 'Three pieces: the outline, the eyes, the mouth. For the eyes, abs(x-7.5) lets you draw one eye and get the other free!',
    intro: `A big smiley face. Look at what <code>abs(x-7.5)</code> does to the eyes!` },
]

const time = [
  { code: 'x==floor(t)%8', learn: ['t', 'floor', 'remainder'], alts: ['x==~~t%8', 'x==(t|0)%8'],
    intro: `<code>t</code> is how many seconds have passed. <code>floor(t)</code> chops off the decimals, so it goes 0, 1, 2, 3...`,
    outro: `The <code>%8</code> makes it wrap around back to 0 after 7, like a clock.` },
  { code: 'y==floor(t*4)%8', alts: ['y==(t*4|0)%8'], intro: `Faster! And going down.` },
  { code: 'floor(t)%2', alts: ['t%2>=1', '(t|0)%2', 't&1'], intro: `Blink, blink.` },
  { code: 'i<t*8', alts: ['i/8<t'], intro: `Filling up.` },
  { code: 'abs(x-3.5)+abs(y-3.5)<t%6', learn: ['abs'], intro: `A growing diamond that starts over.` },
  { code: 'x==abs(floor(t*4)%14-7)', learn: ['abs'], hint: 'Something counts 0 to 13, subtract 7 to get -7 to 6, then abs()',
    intro: `Bouncing! This one is hard.`,
    outro: `<code>abs()</code> turns a number line that goes -7...0...6 into 7...0...6. Down then up!` },
  { code: 'i==floor(t*8)%64', alts: ['i==(t*8|0)%64', 'i==floor(t*8%64)'], intro: `A dot reading the grid like a book.` },
  { code: 'sin(t*2-hypot(x-7.5,y-7.5))', size: 16, learn: ['sin', 'hypot'], intro: `Ripples that move. Start with the pond from the shading pack.` },
  { code: 'y==floor(t*4+x*x)%8', hint: 'Every column starts at a different place. Try x*x.', intro: `Rain! Every column is falling, but they all start at different spots.` },
  { code: 'PI-atan2(x-7.5,y-7.5)<t%7', size: 16, learn: ['atan2'], hint: 'atan2(x-7.5,y-7.5) is the angle around the middle. It goes from -PI to PI (about -3.14 to 3.14).',
    intro: `A sweeping clock hand. This uses angles! <code>atan2()</code> tells you which direction a dot is from the middle.` },
]

const bits = [
  { code: 'x&1', size: 16, learn: ['binary', 'bitand'], alts: ['x%2'],
    intro: `Computers store numbers in <b>binary</b>, using only 0s and 1s. 5 is <code>101</code> in binary (4+1). <code>x&1</code> asks "is the 1s bit on?" Click dots to see their binary in the inspector.` },
  { code: 'x&4', size: 16, alts: ['x%8>3', 'x>>2&1'], intro: `Now check the 4s bit instead.`,
    outro: `<code>x&4</code> gives 4 or 0. 4 is bigger than 1, so it still makes a full dot.` },
  { code: '!(x&y)', size: 16,
    intro: `Something amazing happens if you check whether <code>x</code> and <code>y</code> share any bits. Try <code>x&y</code>, then flip it with <code>!</code>`,
    outro: `This is called the Sierpinski triangle. It has triangles inside triangles inside triangles, forever.` },
  { code: '(x^y)&1', size: 16, learn: ['xor'], alts: ['(x+y)%2', 'x+y&1'],
    intro: `<code>^</code> is XOR: "one or the other, but not both". It compares bits.` },
  { code: '!(x^y)', size: 16, alts: ['x==y'], intro: `XOR is 0 when both numbers are exactly the same.` },
  { code: '(x^y)&4', size: 16, alts: ['(floor(x/4)+floor(y/4))%2'], intro: `A big checkerboard, using XOR.` },
  { code: '(x|y)<8', size: 16, learn: ['bitor'], alts: ['x<8&y<8', 'x<8&&y<8', 'max(x,y)<8'],
    intro: `<code>|</code> (just one line) joins the bits together. When is <code>x|y</code> small?`,
    outro: `If either number has the 8s bit, then <code>x|y</code> has it too. So both have to be under 8.` },
  { code: 'x>>2==y>>2', size: 16, learn: ['shift'], alts: ['floor(x/4)==floor(y/4)'],
    intro: `<code>&gt;&gt;</code> slides the bits to the right. <code>x&gt;&gt;2</code> is like dividing by 4 and chopping off the decimals.` },
  { code: '(x*y)&8', size: 16, intro: `A mystery! Multiply, then check a bit.` },
  { code: '!((x+floor(t*4))&y)', size: 16, learn: ['t'], intro: `A moving Sierpinski triangle. Can you figure it out?` },
]

const manyWays = [
  { code: 'x<3', ways: 4, alts: ['x<=2', '!(x>2)', '[0,1,2].includes(x)', 'x/3<1'],
    intro: `Find <b>4 different ways</b> to make this pattern. Ideas: <code>&lt;</code>, <code>&lt;=</code>, <code>!</code>, <code>includes</code>, or even division.` },
  { code: 'y==0', ways: 4, alts: ['i<8', '!y', 'y<1', 'i>>3==0'], intro: `Find <b>4 ways</b>. Can you use <code>i</code> for one of them? What about <code>!</code>?` },
  { code: 'x==y', ways: 3, alts: ['i%9==0', '!(x-y)', 'x-y==0', '!(i%9)', '!(x^y)'], intro: `Find <b>3 ways</b>. You've seen at least two already!` },
  { code: 'x==0||x==7', ways: 3, alts: ['x%7==0', '!(x%7)', '[0,7].includes(x)', 'abs(x-3.5)>3'], intro: `Find <b>3 ways</b>.` },
  { code: '(x+y)%2', ways: 4, alts: ['x+y&1', '(x^y)&1', 'x%2^y%2', 'i%2^y%2', '(i+y)%2'], intro: `Find <b>4 ways</b> to make a checkerboard.` },
  { code: 'x>3&&y>3', ways: 3, alts: ['min(x,y)>3', 'x>3&y>3', 'x&y&4'], intro: `Find <b>3 ways</b>.` },
  { code: 'x==0||x==7||y==0||y==7', ways: 2, alts: ['!(x%7&&y%7)', '!(x%7*y%7)'],
    intro: `🏌️ Code golf: the shortest answer wins. The long way is 22 characters. Can you do it in 11 or fewer?`,
    hint: 'x%7 is 0 on the left and right edges' },
  { code: 'x==2||x==4||x==6', ways: 2, alts: ['x>1&x%2<1', 'x>1&&x%2==0', '!(x%2)&&x>0'],
    intro: `🏌️ Code golf. Can you do it in 9 characters?` },
  { code: 'x<4&&y<4', ways: 2, alts: ['x<4&y<4', '(x|y)<4', 'max(x,y)<4'],
    intro: `🏌️ Code golf. Can you do it in 7 characters? There are two different ways!` },
]

export const GROUPS = [
  { id: 'mommy1', cover: { code: 'i<38', size: 8 }, title: "Mommy's Pack 1", subtitle: 'x, y and i', difficulty: 1, levels: mommy1 },
  { id: 'mommy2', cover: { code: 'x==0||x==7||x==y', size: 8 }, title: "Mommy's Pack 2", subtitle: '|| and &&', difficulty: 1, levels: mommy2 },
  { id: 'tutorial', cover: { code: 'sin(t-sqrt((x-15.5)**2+(y-15.5)**2))', size: 32 }, title: 'The Original Tutorial', subtitle: 'by @JakeGMaths at mathsuniverse.com', difficulty: 2, levels: tutorial },
  { id: 'shapes', cover: { code: 'abs(x-3.5)+abs(y-3.5)==4', size: 8 }, title: 'Shape Workshop', subtitle: 'abs, max, min and drawing pictures', difficulty: 2, levels: shapes },
  { id: 'remainder', cover: { code: 'y%2==0||(x+y%4)%4==0', size: 8 }, title: 'Remainder Magic', subtitle: 'patterns that repeat with %', difficulty: 2, levels: remainder },
  { id: 'redwhite', cover: { code: '-(y?abs(x-3.5)<6-y:abs(abs(x-3.5)-2)<1)', size: 8 }, title: 'Red & White', subtitle: 'flags, -1 and ? :', difficulty: 3, levels: redWhite },
  { id: 'shading', cover: { code: 'cos(hypot(x-7.5,y-7.5)-t*2)', size: 16 }, title: 'Sizes & Shading', subtitle: 'numbers between 0 and 1', difficulty: 3, levels: shading },
  { id: 'big', cover: { code: 'abs(hypot(x-7.5,y-7.5)-7)<0.7||hypot(abs(x-7.5)-3,y-5)<1.2||y>9&&y<11&&abs(x-7.5)<4', size: 16 }, title: 'Big Grids', subtitle: 'circles, waves and smileys', difficulty: 3, levels: big },
  { id: 'time', cover: { code: 'x==abs(floor(t*4)%14-7)||y==abs(floor(t*3)%14-7)', size: 8 }, title: 'Time Machine', subtitle: 'animate with t', difficulty: 4, levels: time },
  { id: 'bits', cover: { code: '!(x&y)', size: 16 }, title: 'Bit Magic', subtitle: 'binary, &, | and ^', difficulty: 5, levels: bits },
  { id: 'ways', cover: { code: '!(x%7&&y%7)', size: 8 }, title: 'Many Ways & Code Golf', subtitle: 'find different answers, find short answers', difficulty: 3, levels: manyWays },
]

// Fill in ids, sizes and records.
for (const group of GROUPS) {
  const seen = {}
  group.levels.forEach((level, n) => {
    const key = `${group.id}:${level.code}`
    seen[key] = (seen[key] || 0) + 1
    level.id = seen[key] > 1 ? `${key}#${seen[key]}` : key
    level.group = group
    level.number = n + 1
    level.size = level.size || 8
    level.ways = level.ways || 2
    level.alts = level.alts || []
    level.record = Math.min(...[level.code, ...level.alts].map(c => c.replace(/\s+/g, '').length))
  })
}

export const LEVELS = GROUPS.flatMap(g => g.levels)

export function findLevel(id) {
  return LEVELS.find(l => l.id === id)
}
