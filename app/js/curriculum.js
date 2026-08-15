// بيانات المنهج — **المصدر الوحيد للحقيقة** (قاعدة `SESSIONS.md` العامة، و`METHOD.md`
// في رأسه: «البياناتُ مصدرُها الوحيد `app/js/curriculum.js` يومَ يُكتب»).
//
// ————— كتبتها **الجلسة ١** على عقدها المعلن (`SESSIONS.md`) —————
//
// وعقدُ الجلسة ٠ الذي كُتب في رأس هذه البذرة قائمٌ بنقاطه الستّ، وهذه مواضعُه:
//
// ١) **رصيدان لا رصيد**: `STARTERS` (كامبردج) و`GRADES` (Letters and Sounds).
// ٢) **مساران مقترنان**: كلُّ كلمةِ قراءةٍ في `GRADES[].words[]` تحمل `listen` —
//    **مفتاحَها السمعيّ مكتوباً**، لا يُشتقّ بمطابقة رسمٍ ولا يُخمَّن. ويقرؤه
//    `tools/check_coupling.mjs`.
// ٣) **كلُّ محطةٍ تُعلن جبهتَها**: `frontier: { fields, symbols, tricky }` —
//    وعليها يقوم `tools/check_range.py` الثلاثيّ.
// ٤) **الرحلةُ محسوبةٌ لا مكتوبة**: `sections()` تؤلّف المراحلَ والعهود والبوابات من
//    الجداول أدناه، ولا رقمَ محطاتٍ مكتوبٌ بيد في هذا الملفّ ولا في حارس.
// ٥) **القفلُ تسلسليّ**: ترتيبُ `sections()` هو ترتيبُ الرحلة.
// ٦) **البوابات الثلاث** في مواضعها من `sections()`.
//
// ————— من أين جاءت كلُّ كلمةٍ ورمز (نقلاً لا تقديراً) —————
//
// **الرصيد السمعيّ**: استُخرج من ملفّ كامبردج الرسميّ نفسِه (PDF، ٤٤ صفحة) لا من
// ذاكرة: صفحاتُ ٤–٧ «Pre A1 Starters A–Z wordlist» ⇒ **٤٩٥ مدخلاً** — وهو عينُ عدد
// الدراسة في `METHOD.md §٣`؛ وصفحاتُ ٣٨–٤٣ «thematic vocabulary list» ⇒ **حقولُ
// المفردات** التي تنبني عليها محطاتُ س١ وس٥ (`FIELDS` أدناه بأسمائها الإنكليزية كما
// وردت). ويقابل `tools/fetch_starters.py --check` ما ههنا بالملفّ الحيّ فيمسك أيَّ
// انحراف.
//
// **سلّمُ الحرف**: الرموزُ نصاً من `METHOD.md §٥` (وهي مجموعاتُ L&S الخمسُ ومراحلُها)،
// **والشائكاتُ التي لم يسمّها المنهج** (المرحلة ٥: خمسٌ وعشرون) نُقلت من وثيقة L&S
// نفسِها ص١٣٢–١٣٣ («Teach reading the words …») — وعُدَّت فطابقت ميزانيةَ `METHOD.md`
// حرفاً بحرف: ٥ ← ١٧ ← ٣١ ← ٥٦.
//
// **الصور**: Twemoji محلية (`app/emoji/`) — و**ما لا صورةَ صادقة له لم يُتكلَّف بل
// رُفِع**: `RAISED` أدناه يحمل كلَّ كلمةٍ من حقول المنهج بلا صورةٍ صادقة وسببَها،
// ويحرس `check_range` ألّا تدخل محطةً.

// ————————————————————————————————————————————————————————————————————————
// ١) الرصيدُ السمعيّ — قائمة Cambridge Pre A1 Starters ‏2025
// ————————————————————————————————————————————————————————————————————————

/** مصدرُ الرصيد بعينه — يقرؤه `tools/fetch_starters.py` فيقابل ما هنا بما هناك. */
export const STARTERS_SOURCE = {
  title: 'Pre A1 Starters, A1 Movers and A2 Flyers Wordlists (2025)',
  url: 'https://www.cambridgeenglish.org/Images/739104-starters-movers-flyers-word-list-2025.pdf',
  pages: { alphabetic: [4, 7], thematic: [38, 43] },
  entries: 495,
};

/**
 * **مداخلُ Starters الـ٤٩٥ كما كُتبت في الملفّ** — بأقواسها ومائلاتها لا تُنقَّح:
 * `'candy (UK sweet(s))'` · `'child/children'` · `'fish (s + pl)'`. فالتنقيحُ رأيٌ،
 * والنقلُ حقيقةٌ تُقابَل. وصِيَغُ الكلمة المسموح بها تُشتقّ منها بقاعدةٍ واحدة
 * معلَنة في `starterForms()` أدناه.
 */
export const STARTERS = [
  'a', 'a lot', 'a lot of', 'about', 'add', 'afternoon', 'again', 'Alex', 'Alice', 'alien',
  'alphabet', 'an', 'and', 'angry', 'animal', 'Ann/Anna', 'answer', 'apartment (UK flat)',
  'apple', 'arm', 'armchair', 'ask', 'at', 'baby', 'badminton', 'bag', 'ball', 'balloon',
  'banana', 'baseball', 'baseball cap', 'basketball', 'bat (as sports equipment)', 'bath',
  'bathroom', 'be', 'beach', 'bean', 'bear', 'beautiful', 'bed', 'bedroom', 'bee', 'behind',
  'Ben', 'between', 'big', 'bike', 'Bill', 'bird', 'birthday', 'black', 'blue', 'board',
  'board game', 'boat', 'body', 'book', 'bookcase', 'bookshop', 'boots', 'bounce', 'box',
  'boy', 'bread', 'breakfast', 'brother', 'brown', 'burger', 'bus', 'but', 'bye', 'cake',
  'camera', 'can', 'candy (UK sweet(s))', 'car', 'carrot', 'cat', 'catch (e.g. a ball)',
  'chair', 'chicken', 'child/children', 'chips (US fries)', 'chocolate', 'choose', 'clap',
  'class', 'classmate', 'classroom', 'clean', 'clock', 'close', 'closed', 'clothes',
  'coconut', 'colour (US color)', 'come', 'complete', 'computer', 'cool', 'correct', 'count',
  'cousin', 'cow', 'crayon', 'crocodile', 'cross', 'cupboard', 'dad', 'Dan', 'day', 'desk',
  'dining room', 'dinner', 'dirty', 'do', 'dog', 'doll', 'donkey', 'don’t worry', 'door',
  'double', 'draw', 'drawing', 'dress', 'drink', 'drive', 'duck', 'ear', 'eat', 'egg',
  'elephant', 'end', 'English', 'enjoy', 'eraser (UK rubber)', 'Eva', 'evening', 'example',
  'eye', 'face', 'family', 'fantastic', 'father', 'favourite (US favorite)', 'find',
  'fish (s + pl)', 'fishing', 'flat (US apartment)', 'floor', 'flower', 'fly', 'food',
  'foot/feet', 'football (US soccer)', 'for', 'friend', 'fries (UK chips)', 'frog', 'from',
  'fruit', 'fun', 'funny', 'game', 'garden', 'get', 'giraffe', 'girl', 'give', 'glasses',
  'go', 'go to bed', 'go to sleep', 'goat', 'good', 'goodbye', 'Grace', 'grandfather',
  'grandma', 'grandmother', 'grandpa', 'grape', 'gray (UK grey)', 'great', 'green',
  'grey (US gray)', 'guitar', 'hair', 'hall', 'hand', 'handbag', 'happy', 'hat', 'have',
  'have got', 'he', 'head', 'helicopter', 'hello', 'her', 'here', 'hers', 'hi', 'him',
  'hippo', 'his', 'hit', 'hobby', 'hockey', 'hold', 'home', 'hooray', 'horse', 'house',
  'how', 'how many', 'how old', 'Hugo', 'I', 'ice cream', 'in', 'in front of', 'it',
  'its', 'jacket', 'jeans', 'jellyfish', 'Jill', 'juice', 'jump', 'keyboard (computer)',
  'kick', 'kid', 'Kim', 'kitchen', 'kite', 'kiwi', 'know', 'lamp', 'learn', 'leg', 'lemon',
  'lemonade', 'lesson', 'letter (as in alphabet)', 'let’s', 'like', 'lime', 'line', 'listen',
  'live', 'living room', 'lizard', 'long', 'look', 'look at', 'lorry (US truck)', 'lots',
  'lots of', 'love', 'Lucy', 'lunch', 'make', 'man/men', 'mango', 'many', 'Mark', 'mat',
  'Matt', 'May (as in girl’s name)', 'me', 'me too', 'meat', 'meatballs', 'milk', 'mine',
  'mirror', 'Miss', 'monkey', 'monster', 'morning', 'mother', 'motorbike', 'mouse (computer)',
  'mouse/mice', 'mouth', 'Mr', 'Mrs', 'mum', 'music', 'my', 'name', 'new', 'next to',
  'nice', 'Nick', 'night', 'no', 'nose', 'not', 'now', 'number', 'of', 'oh', 'oh dear', 'OK',
  'old', 'on', 'one', 'onion', 'open', 'or', 'orange', 'our', 'ours', 'page', 'paint',
  'painting', 'paper', 'pardon', 'park', 'part', 'Pat', 'pea', 'pear', 'pen', 'pencil',
  'person/people', 'pet', 'phone', 'photo', 'piano', 'pick up', 'picture', 'pie', 'pineapple',
  'pink', 'plane', 'play', 'playground', 'please', 'point', 'polar bear', 'poster', 'potato',
  'purple', 'put', 'question', 'radio', 'read', 'really', 'red', 'rice', 'ride', 'right',
  'right (as in correct)', 'robot', 'room', 'rubber (US eraser)', 'rug', 'ruler', 'run',
  'sad', 'Sam', 'sand', 'sausage', 'say', 'scary', 'school', 'sea', 'see', 'see you',
  'sentence', 'she', 'sheep (s + pl)', 'shell', 'ship', 'shirt', 'shoe', 'shop (US store)',
  'short', 'shorts', 'show', 'silly', 'sing', 'sister', 'sit', 'skateboard', 'skateboarding',
  'skirt', 'sleep', 'small', 'smile', 'snake', 'so', 'soccer (UK football)', 'sock', 'sofa',
  'some', 'song', 'sorry', 'spell', 'spider', 'sport', 'stand', 'start', 'stop',
  'store (UK shop)', 'story', 'street', 'Sue', 'sun', 'sweet(s) (US candy)', 'swim',
  'T-shirt', 'table', 'table tennis', 'tablet', 'tail', 'take a photo/picture', 'talk',
  'teacher', 'teddy (bear)', 'television/TV', 'tell', 'tennis', 'tennis racket', 'thank you',
  'thanks', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they',
  'thing', 'this', 'those', 'throw', 'tick', 'tiger', 'to', 'today', 'Tom', 'tomato', 'too',
  'toy', 'train', 'tree', 'trousers', 'truck (UK lorry)', 'try', 'TV/television', 'ugly',
  'under', 'understand', 'us', 'very', 'walk', 'wall', 'want', 'watch', 'water', 'watermelon',
  'wave', 'we', 'wear', 'well', 'well done', 'what', 'where', 'which', 'white', 'who',
  'whose', 'window', 'with', 'woman/women', 'word', 'would like', 'wow', 'write', 'year',
  'yellow', 'yes', 'you', 'young', 'your', 'yours', 'zebra', 'zoo',
];

/**
 * **بندٌ في القائمة نفسِها لا في ذاكرتنا** (ص٧ نصاً): «Candidates will be expected to
 * understand and write the letters of the alphabet and **numbers 1–20**». فأسماءُ
 * الأعداد مطلوبةٌ في الرصيد وليست مداخلَ في جدول A–Z (وحدَها `one` مدخل) — فتُعلَن هنا
 * ببندها، ومنها تُبنى محطةُ س١-٦.
 */
export const STARTERS_LETTERS_NOTE =
  'Candidates will be expected to understand and write the letters of the alphabet '
  + 'and numbers 1–20.';

/** أسماءُ الأعداد ١–٢٠ — مادّةُ البند أعلاه (والمحطةُ تأخذ العشرةَ الأولى). */
export const NUMBER_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen', 'twenty',
];

/**
 * **صِيَغٌ صرفية لمداخلَ في الرصيد** — قليلةٌ ومعلَنةٌ بمدخلها، لا اشتقاقَ صامت.
 * جملُ س٥-٦ تقول «The cat **is** on the bed»، و`is` صيغةُ `be` وهو مدخلٌ في القائمة.
 * فالقاعدةُ أن يُكتب الاستثناءُ ومرجعُه، لا أن يُصرَّف الرصيدُ بخوارزمية.
 */
export const FORMS = { is: 'be', am: 'be', are: 'be' };

/**
 * **صِيَغُ الكلمة المقبولة من مدخلٍ واحد** — قاعدةٌ واحدة تُقرأ ولا تُخمَّن:
 * يُسقَط ما بين قوسين (`bat (as sports equipment)` ⇒ `bat`)، ويُشقّ ما فيه مائل
 * (`child/children` ⇒ الاثنتان)، ويُقبل ما في القوس إن كان بديلاً لهجياً
 * (`colour (US color)` ⇒ `colour` و`color`).
 */
export function starterForms() {
  const forms = new Set();
  for (const entry of STARTERS) {
    const head = entry.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    for (const part of head.split('/')) if (part.trim()) forms.add(part.trim());
    for (const inside of entry.match(/\(([^)]*)\)/g) || []) {
      const body = inside.slice(1, -1).replace(/^(UK|US)\s+/, '').replace(/[()]/g, '');
      if (/^[a-z-]+$/i.test(body)) forms.add(body.trim());
    }
  }
  for (const word of NUMBER_WORDS) forms.add(word);
  for (const form of Object.keys(FORMS)) forms.add(form);
  return forms;
}

/** أهذه الكلمةُ من الرصيد السمعيّ المُعلَن؟ (يقرؤها الفاحصان). */
export function inBank(word) {
  return starterForms().has(String(word));
}

// ————————————————————————————————————————————————————————————————————————
// ٢) حقولُ الرصيد — من «thematic vocabulary list» بأسمائها هناك
// ————————————————————————————————————————————————————————————————————————

/**
 * حقولُ كامبردج التي تنبني عليها محطاتُ س١ وس٥ (`METHOD.md §٤`). و`en` اسمُ الحقل في
 * الملفّ حرفاً — فمن أراد أن يقابل كلمةً بحقلها وجد العمودَ بعينه.
 */
export const FIELDS = [
  { id: 'family', ar: 'الأهل', en: 'Family & friends' },
  { id: 'body', ar: 'الجسد والوجه', en: 'The body and the face' },
  { id: 'animals', ar: 'الحيوانات', en: 'Animals' },
  { id: 'food', ar: 'الطعام والشراب', en: 'Food & drink' },
  { id: 'colours', ar: 'الألوان', en: 'Colours' },
  { id: 'numbers', ar: 'الأعداد', en: 'Numbers' },
  { id: 'clothes', ar: 'الملابس', en: 'Clothes' },
  { id: 'school', ar: 'المدرسة واللعب', en: 'School · Toys · Sports & leisure' },
  { id: 'home', ar: 'البيت أغراضاً', en: 'The home' },
  { id: 'places', ar: 'الأماكن والطبيعة', en: 'Places & directions · The world around us' },
  { id: 'verbs', ar: 'أفعالُ اليوم', en: 'School · Sports & leisure (verbs)' },
  { id: 'sentences', ar: 'جملُ الآن وهنا', en: '—' },
];

// ————————————————————————————————————————————————————————————————————————
// ٣) الرصيدُ المصوَّر — كلمةٌ بحقلها ومحطتها وصورتها ومفتاحها
// ————————————————————————————————————————————————————————————————————————
//
// **الصورةُ صادقةٌ أو لا تكون**: `face` رمزُ Twemoji واحدٌ يرسم الكلمةَ نفسَها لا
// معناها القريب. وثلاثُ محطاتٍ لا صورةَ **مفردة** لكلماتها بطبيعتها، فتُعلن ذلك
// في `pictures` وتتولّى شاشتُها التصوير:
//   • `count` (س١-٦): صورةُ العدد **كميةٌ تُعَدّ** لا رقمٌ يُقرأ (قاعدةُ «اِحْسِبْ»:
//     الرمزُ تسميةٌ لكمٍّ حاضر) — فلكلِّ كلمةٍ `count` لا `face`.
//   • `scene` (س٢-٢ · س٢-٤ · س٥-٦): المعنى **ترتيبُ شيئين** (in/on/under · «السمكةُ
//     الحمراء» · «القطةُ على السرير») — تُصوَّر مشهداً لا رمزاً.
//   • `act` (س٢-٣): الفعلُ حركةٌ تفعلها الشخصية بلمسة الطفل — لا رمزَ ساكناً له.
//   • `swatch` (س١-٥): **بقعةُ لونٍ مُصيَّرة** — حكمُ المدير ١٣ أغسطس (`METHOD.md §٤`
//     أحكامُ المادة): «الألوانُ بلا مربع يونيكود (pink · grey) تُصوَّر بقعةَ لونٍ
//     مُصيَّرة (CSS) — صدقُ الصورة لا يشترط إيموجي، والبقعةُ أصدقُ من بديلٍ ملتبس».
//     فمحطةُ الألوان نمطُها `swatch`: كلمتُها **صورةٌ أو بقعةٌ بقيمة لونها**، ولا
//     بقعةَ لكلمةٍ من غير حقل الألوان (يحرسه `check_range` بابَه الأول).

/**
 * كلماتُ الرصيد المصوَّر: `w` الكلمة · `field` حقلُها · `at` محطتُها · `face` صورتُها
 * (أو `count` كمّيةً · `swatch` بقعةَ لون · `pictured` سببَ ألّا تكون صورةً مفردة).
 */
export const WORDS = [
  // س١-١ الأهل
  { w: 'mum', field: 'family', at: 's1-1', face: '👩‍👦' },
  { w: 'dad', field: 'family', at: 's1-1', face: '👨‍👧' },
  { w: 'baby', field: 'family', at: 's1-1', face: '👶' },
  { w: 'boy', field: 'family', at: 's1-1', face: '👦' },
  { w: 'girl', field: 'family', at: 's1-1', face: '👧' },
  { w: 'grandma', field: 'family', at: 's1-1', face: '👵' },
  { w: 'grandpa', field: 'family', at: 's1-1', face: '👴' },
  { w: 'family', field: 'family', at: 's1-1', face: '👨‍👩‍👧‍👦' },
  { w: 'friend', field: 'family', at: 's1-1', face: '🧑‍🤝‍🧑' },
  // س١-٢ الجسد والوجه
  { w: 'ear', field: 'body', at: 's1-2', face: '👂' },
  { w: 'eye', field: 'body', at: 's1-2', face: '👁️' },
  { w: 'nose', field: 'body', at: 's1-2', face: '👃' },
  { w: 'mouth', field: 'body', at: 's1-2', face: '👄' },
  { w: 'hand', field: 'body', at: 's1-2', face: '✋' },
  { w: 'foot', field: 'body', at: 's1-2', face: '🦶' },
  { w: 'leg', field: 'body', at: 's1-2', face: '🦵' },
  // س١-٣ الحيوانات
  { w: 'cat', field: 'animals', at: 's1-3', face: '🐈' },
  { w: 'dog', field: 'animals', at: 's1-3', face: '🐕' },
  { w: 'bird', field: 'animals', at: 's1-3', face: '🐦' },
  { w: 'fish', field: 'animals', at: 's1-3', face: '🐟' },
  { w: 'horse', field: 'animals', at: 's1-3', face: '🐎' },
  { w: 'cow', field: 'animals', at: 's1-3', face: '🐄' },
  { w: 'duck', field: 'animals', at: 's1-3', face: '🦆' },
  { w: 'sheep', field: 'animals', at: 's1-3', face: '🐑' },
  { w: 'goat', field: 'animals', at: 's1-3', face: '🐐' },
  { w: 'elephant', field: 'animals', at: 's1-3', face: '🐘' },
  { w: 'monkey', field: 'animals', at: 's1-3', face: '🐒' },
  { w: 'frog', field: 'animals', at: 's1-3', face: '🐸' },
  { w: 'bee', field: 'animals', at: 's1-3', face: '🐝' },
  { w: 'bear', field: 'animals', at: 's1-3', face: '🐻' },
  { w: 'tiger', field: 'animals', at: 's1-3', face: '🐅' },
  { w: 'snake', field: 'animals', at: 's1-3', face: '🐍' },
  { w: 'spider', field: 'animals', at: 's1-3', face: '🕷️' },
  // س١-٤ الطعام والشراب
  { w: 'apple', field: 'food', at: 's1-4', face: '🍎' },
  { w: 'banana', field: 'food', at: 's1-4', face: '🍌' },
  { w: 'pear', field: 'food', at: 's1-4', face: '🍐' },
  { w: 'grape', field: 'food', at: 's1-4', face: '🍇' },
  { w: 'bread', field: 'food', at: 's1-4', face: '🍞' },
  { w: 'milk', field: 'food', at: 's1-4', face: '🥛' },
  { w: 'water', field: 'food', at: 's1-4', face: '💧' },
  { w: 'egg', field: 'food', at: 's1-4', face: '🥚' },
  { w: 'cake', field: 'food', at: 's1-4', face: '🍰' },
  { w: 'carrot', field: 'food', at: 's1-4', face: '🥕' },
  { w: 'rice', field: 'food', at: 's1-4', face: '🍚' },
  { w: 'ice cream', field: 'food', at: 's1-4', face: '🍦' },
  // س١-٥ الألوان — والمربّعُ الملوّن أصدقُ صورةٍ للّون: لا شيءَ فيه سواه.
  // **وأربعةٌ تحمل قيمتَها معها**: هي ألوانُ الأمر المركّب في س٢-٤ (كرةٌ حمراء
  // كبيرة)، وقيمتُها **قيمةُ مربّعها في Twemoji نفسِها** — فاللونُ الذي رآه الطفلُ
  // مربّعاً هو اللونُ الذي يراه كرةً، ولا لونان لاسمٍ واحد.
  { w: 'red', field: 'colours', at: 's1-5', face: '🟥', swatch: '#DD2E44' },
  { w: 'blue', field: 'colours', at: 's1-5', face: '🟦', swatch: '#55ACEE' },
  { w: 'green', field: 'colours', at: 's1-5', face: '🟩', swatch: '#78B159' },
  { w: 'yellow', field: 'colours', at: 's1-5', face: '🟨', swatch: '#FDCB58' },
  { w: 'orange', field: 'colours', at: 's1-5', face: '🟧' },
  { w: 'purple', field: 'colours', at: 's1-5', face: '🟪' },
  { w: 'brown', field: 'colours', at: 's1-5', face: '🟫' },
  { w: 'black', field: 'colours', at: 's1-5', face: '⬛' },
  { w: 'white', field: 'colours', at: 's1-5', face: '⬜' },
  // **وبقعتان مُصيَّرتان بصدق لونهما** (حكمُ المدير — `METHOD.md §٤`): لا مربّعَ
  // ورديّ ولا رماديّ في يونيكود، والقيمةُ هنا **قيمةُ اللون نفسِه** لا تقريبٌ له
  // (`pink` و`gray` من ألوان CSS المسمّاة حرفاً) — فما يراه الطفلُ هو ما يُسمّى.
  { w: 'pink', field: 'colours', at: 's1-5', swatch: '#FFC0CB' },
  { w: 'grey', field: 'colours', at: 's1-5', swatch: '#808080' },
  // س١-٦ الأعداد سمعاً — كميةٌ تُعَدّ لا رقمٌ يُقرأ
  { w: 'one', field: 'numbers', at: 's1-6', count: 1 },
  { w: 'two', field: 'numbers', at: 's1-6', count: 2 },
  { w: 'three', field: 'numbers', at: 's1-6', count: 3 },
  { w: 'four', field: 'numbers', at: 's1-6', count: 4 },
  { w: 'five', field: 'numbers', at: 's1-6', count: 5 },
  { w: 'six', field: 'numbers', at: 's1-6', count: 6 },
  { w: 'seven', field: 'numbers', at: 's1-6', count: 7 },
  { w: 'eight', field: 'numbers', at: 's1-6', count: 8 },
  { w: 'nine', field: 'numbers', at: 's1-6', count: 9 },
  { w: 'ten', field: 'numbers', at: 's1-6', count: 10 },
  // س٢-٢ أوامرُ الوضع المكاني — حروفُ الجرّ مشهدٌ لا رمز
  { w: 'in', field: 'places', at: 's2-2', pictured: 'scene' },
  { w: 'on', field: 'places', at: 's2-2', pictured: 'scene' },
  { w: 'under', field: 'places', at: 's2-2', pictured: 'scene' },
  { w: 'behind', field: 'places', at: 's2-2', pictured: 'scene' },
  // س٢-٣ أفعالُ الحركة — حركةٌ تُفعَل لا صورةٌ تُرى
  { w: 'jump', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'clap', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'run', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'walk', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'sit', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'stand', field: 'verbs', at: 's2-3', pictured: 'act' },
  // **وثلاثٌ نزلت من `RAISED` إلى الفعل** (حكمُ المدير ١٣ أغسطس — `METHOD.md §٤`):
  // «ما له فعلٌ جسديّ من المرفوعات (arm · face · smile…) يُنقل لشكل `tpr`
  // («المس ذراعك» — **الفعلُ جوابُه**) بدل الصورة الملتبسة». فما امتنع تصويرُه
  // رمزاً ساكناً (💪 عضلةٌ لا ذراع · وجوهُ الإيموجي كلُّها وجوه) يُؤدَّى **حركةً**:
  // الشخصيةُ تلمس ذراعَها أو وجهَها أو تبتسم، والطفلُ يلمس الفاعلةَ ثم يفعلها معها.
  // ونسبُها محفوظٌ في `RESOLVED` أدناه.
  // و`order` أمرُها المنطوق حيث يفارق قالبَ محطته (أدناه): الفعلُ يُؤمَر به مجرَّداً
  // («jump»)، وعضوُ الجسد يُؤمَر بلمسه («touch your arm») — والابتسامةُ فعلٌ فتُجرَّد.
  { w: 'arm', field: 'body', at: 's2-3', pictured: 'act', order: 'point to your arm' },
  { w: 'face', field: 'body', at: 's2-3', pictured: 'act', order: 'point to your face' },
  { w: 'smile', field: 'body', at: 's2-3', pictured: 'act' },
  // س٢-٤ الأمرُ المركّب — الصفةُ تُميَّز في مشهدٍ من شيئين
  { w: 'big', field: 'school', at: 's2-4', pictured: 'scene' },
  { w: 'small', field: 'school', at: 's2-4', pictured: 'scene' },
  // س٥-١ الملابس
  { w: 'hat', field: 'clothes', at: 's5-1', face: '🎩' },
  { w: 'shoe', field: 'clothes', at: 's5-1', face: '👟' },
  { w: 'sock', field: 'clothes', at: 's5-1', face: '🧦' },
  { w: 'dress', field: 'clothes', at: 's5-1', face: '👗' },
  { w: 'T-shirt', field: 'clothes', at: 's5-1', face: '👕' },
  { w: 'jacket', field: 'clothes', at: 's5-1', face: '🧥' },
  { w: 'jeans', field: 'clothes', at: 's5-1', face: '👖' },
  { w: 'boots', field: 'clothes', at: 's5-1', face: '🥾' },
  { w: 'glasses', field: 'clothes', at: 's5-1', face: '👓' },
  // س٥-٢ المدرسة واللعب
  { w: 'book', field: 'school', at: 's5-2', face: '📚' },
  { w: 'pen', field: 'school', at: 's5-2', face: '🖊️' },
  { w: 'pencil', field: 'school', at: 's5-2', face: '✏️' },
  { w: 'ruler', field: 'school', at: 's5-2', face: '📏' },
  { w: 'school', field: 'school', at: 's5-2', face: '🏫' },
  { w: 'ball', field: 'school', at: 's5-2', face: '⚽' },
  { w: 'kite', field: 'school', at: 's5-2', face: '🪁' },
  { w: 'guitar', field: 'school', at: 's5-2', face: '🎸' },
  { w: 'teddy', field: 'school', at: 's5-2', face: '🧸' },
  { w: 'robot', field: 'school', at: 's5-2', face: '🤖' },
  { w: 'car', field: 'school', at: 's5-2', face: '🚗' },
  { w: 'train', field: 'school', at: 's5-2', face: '🚆' },
  { w: 'plane', field: 'school', at: 's5-2', face: '✈️' },
  { w: 'boat', field: 'school', at: 's5-2', face: '⛵' },
  { w: 'bike', field: 'school', at: 's5-2', face: '🚲' },
  { w: 'ship', field: 'school', at: 's5-2', face: '🚢' },
  // س٥-٣ البيت أغراضاً
  { w: 'bed', field: 'home', at: 's5-3', face: '🛏️' },
  { w: 'chair', field: 'home', at: 's5-3', face: '🪑' },
  { w: 'door', field: 'home', at: 's5-3', face: '🚪' },
  { w: 'window', field: 'home', at: 's5-3', face: '🪟' },
  { w: 'clock', field: 'home', at: 's5-3', face: '🕰️' },
  { w: 'lamp', field: 'home', at: 's5-3', face: '💡' },
  { w: 'mirror', field: 'home', at: 's5-3', face: '🪞' },
  { w: 'sofa', field: 'home', at: 's5-3', face: '🛋️' },
  { w: 'bath', field: 'home', at: 's5-3', face: '🛁' },
  { w: 'box', field: 'home', at: 's5-3', face: '📦' },
  { w: 'phone', field: 'home', at: 's5-3', face: '📱' },
  // س٥-٤ الأماكن والطبيعة
  { w: 'tree', field: 'places', at: 's5-4', face: '🌳' },
  { w: 'flower', field: 'places', at: 's5-4', face: '🌸' },
  { w: 'sun', field: 'places', at: 's5-4', face: '☀️' },
  { w: 'sea', field: 'places', at: 's5-4', face: '🌊' },
  { w: 'beach', field: 'places', at: 's5-4', face: '🏖️' },
  { w: 'shell', field: 'places', at: 's5-4', face: '🐚' },
  { w: 'street', field: 'places', at: 's5-4', face: '🛣️' },
  { w: 'house', field: 'places', at: 's5-4', face: '🏠' },
  { w: 'stop', field: 'places', at: 's5-4', face: '🛑' },
  // س٥-٥ أفعالُ اليوم
  { w: 'eat', field: 'verbs', at: 's5-5', face: '🍽️' },
  { w: 'drink', field: 'verbs', at: 's5-5', face: '🥤' },
  { w: 'sleep', field: 'verbs', at: 's5-5', face: '😴' },
  { w: 'read', field: 'verbs', at: 's5-5', face: '📖' },
  { w: 'write', field: 'verbs', at: 's5-5', face: '✍️' },
  { w: 'swim', field: 'verbs', at: 's5-5', face: '🏊' },
];

/**
 * **ما لا صورةَ صادقة له: يُرفَع ولا يُتكلَّف** (بندُ الجلسة نصاً). هذه كلماتٌ من
 * حقول `METHOD.md §٤` نفسِها امتنع تصويرُها صدقاً، فلم تدخل محطةً — ويحرس
 * `check_range` ألّا تدخلها لاحقاً بلا قرار. وهي **بندٌ يُرفَع إلى مدير المشروع**.
 */
export const RAISED = [
  // **ومرادفا التحيّة بقيا بعد حكم ١٣ أغسطس**: صارت `hello` و`bye` طقسَ المعلم
  // (`RESOLVED` أدناه)، وطقسٌ **واحد** لا طقسان بمعنىً واحد — فلا موضعَ لمرادفَيهما
  // اليوم، ويدخلان الرصيدَ حين يسمعهما الطفلُ في سياقٍ يرفع اللبس (نصُّ الحكم).
  { w: 'hi', field: 'family', why: 'مرادفُ hello — وطقسُ الافتتاح واحدٌ لا يُثنّى، ولا صورةَ تميّزه' },
  { w: 'goodbye', field: 'family', why: 'مرادفُ bye — وطقسُ الختام واحدٌ كذلك' },
  { w: 'brother', field: 'family', why: '«👦» صورةُ boy لا صورةُ أخٍ — والقرابةُ علاقةٌ لا شكل' },
  { w: 'sister', field: 'family', why: 'كسابقتها مع «👧»' },
  { w: 'body', field: 'body', why: 'لا رمزَ للجسد كلِّه إلا شخصٌ كامل، فيُخلَط بـ boy/girl/man' },
  // **وهاتان بقيتا بعد حكم ١٣ أغسطس بسببٍ زائد**: الحكمُ ينقل «ما له فعلٌ جسديّ»
  // إلى `tpr`، وفعلُهما **لا يُميَّز في صورةِ وضعٍ واحدة**: يدٌ على الرأس ويدٌ في
  // الشعر وضعٌ واحد لعينِ طفل — وهو عينُ اللبس الذي رُفعتا له، منقولاً من الرمز
  // إلى الوضع. فتبقيان حتى تدخلا الرصيدَ عبر جمل س٥-٦ السياقية (نصُّ الحكم).
  { w: 'head', field: 'body', why: 'لا رمزَ لرأسٍ مجرَّد («🗣» وجهٌ يتكلم) — ووضعُ «المس رأسك» يلتبس بـ hair في صورةٍ واحدة' },
  { w: 'hair', field: 'body', why: '«💇» قصُّ شعرٍ لا شَعر — ووضعُ لمسه يلتبس بـ head' },
  { w: 'colour', field: 'colours', why: 'اسمُ جنسٍ لا لون — لا يُصوَّر بمربّعٍ واحد ولا ببقعةٍ واحدة' },
  { w: 'skirt', field: 'clothes', why: '«👗» فستانٌ (dress) — ولا رمزَ للتنّورة وحدَها' },
  { w: 'shirt', field: 'clothes', why: '«👕» قميصُ T-shirt بعينه، وهو مدخلٌ آخر في القائمة' },
  { w: 'bag', field: 'clothes', why: '«👜» حقيبةُ يدٍ (handbag) لا حقيبةً مطلقة' },
  { w: 'zoo', field: 'animals', why: 'لا رمزَ لحديقة حيوان — وأيُّ حيوانٍ يُرسَم يصير اسمَه هو' },
  { w: 'park', field: 'places', why: '«🏞» منظرٌ طبيعيّ يلتبس بـ tree وsea معاً' },
  { w: 'sand', field: 'places', why: '«🏖» شاطئٌ (beach) وهو مدخلٌ آخر' },
];

/**
 * **ما كان مرفوعاً فحُلَّ — بحكمٍ لا باجتهاد** (المدير، ١٣ أغسطس ٢٠٢٦ · `METHOD.md §٤`
 * أحكامُ المادة). و`RAISED` أعلاه **حالُها الجديد** فسقطت منه هذه التسع، وهذا سِجلُّ
 * نسبها: من أين خرجت وإلى أين ذهبت — فلا يعود أحدٌ يسأل «ولِمَ دخلت `pink` وقد
 * رُفعت؟» ولا تُعاد `hello` محطةً مصوَّرة بحسن نيّة.
 *
 * ويحرسه `check_range`: لا كلمةَ في هذا السجلّ باقيةٌ في `RAISED`، وكلٌّ **بلغت
 * مقصدَها فعلاً** (الرصيدَ المصوَّر أو طقسَ المعلم المنطوق).
 */
export const RESOLVED = [
  { w: 'hello', to: 'ritual', why: 'طقسُ المعلم المنطوق: يفتتح كلَّ جلسةٍ بتحيّة — تُكتسَب سماعاً كما يكتسب الطفلُ السلام، بلا سؤالٍ مصوَّرٍ يستحيل جوابُه' },
  { w: 'bye', to: 'ritual', why: 'كسابقتها ختاماً — «Bye bye!» آخرَ كل جلسة' },
  { w: 'pink', to: 'swatch', why: 'بقعةُ لونٍ مُصيَّرة بقيمة لونها — أصدقُ من مربّعٍ ملتبس' },
  { w: 'grey', to: 'swatch', why: 'كسابقتها' },
  { w: 'arm', to: 'act', why: '«point to your arm» — الفعلُ جوابُه: الشخصيةُ تلمس ذراعَها في س٢-٣' },
  { w: 'face', to: 'act', why: '«touch your face» — يدٌ على الوجه وضعٌ يُرى، ولا يلتبس بابتسامةٍ' },
  { w: 'smile', to: 'act', why: '«smile» — ابتسامةٌ تُفعَل لا وجهٌ يُختار' },
];

/**
 * **طقسُ المعلم المنطوق** (حكمُ المدير — `METHOD.md §٤`): «التحياتُ طقسُ المعلم
 * المنطوق لا محطةٌ مصوَّرة: يفتتح المعلمُ كلَّ جلسةٍ بتحيةٍ ويختمها بوداع».
 *
 * فهذان نصّان **إنكليزيان بلا قياسٍ بصريّ**: لا محطةَ لهما ولا مفتاحَ ليتنر ولا
 * سؤال — يُسمعان في موضعهما من كل جلسة محطة (`station.js`)، ويدخلان قائمةَ الصوت
 * كسائر المادّة. ومادّتُهما من الرصيد نفسِه (`hello` · `bye` مدخلان في Starters).
 */
export const RITUAL = { open: 'Hello!', close: 'Bye bye!' };

// ————————————————————————————————————————————————————————————————————————
// ٤) سلّمُ الحرف — Letters and Sounds ‏2007 بمراحله وشائكاته المعدودة
// ————————————————————————————————————————————————————————————————————————

/** مصدرُ السلّم بعينه (وثيقة 00281-2007) — كما في `METHOD.md §٣`. */
export const LS_SOURCE = {
  title: 'Letters and Sounds: Principles and Practice of High Quality Phonics (2007)',
  url: 'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/'
    + 'attachment_data/file/190599/Letters_and_Sounds_-_DFES-00281-2007.pdf',
  pages: { phase2: 48, phase3: 74, phase5: [134, 135] },
};

/**
 * **العهودُ الأربعة وميزانيةُ شائكاتها** (`METHOD.md §٥`: ٥ ← ١٧ ← ٣١ ← ٥٦).
 * والميزانيةُ **رقمُ منهجٍ مكتوب**، والمحصيُّ يُحسب من `GRADES` ويُقابَل به —
 * فمن زاد شائكةً بلا قرارٍ أحمرَّ `check_range` (البابُ الثالث).
 */
export const ERAS = [
  { id: 'letter1', phase: 2, ar: 'العهد الأول — تسعةَ عشرَ حرفاً والدمجُ الأول', trickyBudget: 5 },
  { id: 'letter2', phase: 3, ar: 'العهد الثاني — تمامُ الرموز الأولى', trickyBudget: 17 },
  { id: 'letter3', phase: 4, ar: 'العهد الثالث — العناقيد', trickyBudget: 31 },
  { id: 'letter4', phase: 5, ar: 'العهد الرابع — البدائل', trickyBudget: 56 },
];

/**
 * **الدرجاتُ الستَّ عشرة** — لكلٍّ: رموزُها (`symbols`) وشائكاتُها (`tricky`)
 * وكلماتُها التي **تُفكّ لأول مرّة عندها** (`words`).
 *
 * و`symbols[].id` معرّفٌ فريد للمهارة، و`g` الرسمُ كما يُكتب. وافترقا في موضعين
 * بعلّتهما: **`oo` رسمٌ واحد لصوتين** (boot/look — نصُّ L&S ص٧٤)، و**نطوقُ ح١٦
 * البديلة** (`ow` في cow غيرُها في yellow) — فلو كان المعرّفُ الرسمَ لَعُدَّت `yellow`
 * مفكوكةً عند ح١١، وهي إنما تُفكّ عند ح١٦. فتُكتب مقاطعُ الكلمة **بمعرّفات** الرموز
 * لا برسومها، ويصير حكمُ «رمزٌ فوق درجته» حكماً دقيقاً لا تقريبياً.
 *
 * و`words[].listen` هو **المفتاحُ السمعيّ معلَناً** (عقدُ الجلسة، النقطة ٢).
 */
export const GRADES = [
  {
    id: 'h01', era: 'letter1', ar: 'ح١',
    symbols: [
      { id: 's', g: 's', ex: 'sun' }, { id: 'a', g: 'a', ex: 'cat' },
      { id: 't', g: 't', ex: 'ten' }, { id: 'p', g: 'p', ex: 'pen' },
    ],
    tricky: [],
    // **ولا دمجَ في ح١**: نصُّ `METHOD.md §٥` («الدمجُ بالرموز **من ح٢**») وعينُ
    // جدول L&S الأسبوعي (الدمجُ يبدأ الأسبوعَ الثاني).
    words: [],
  },
  {
    id: 'h02', era: 'letter1', ar: 'ح٢',
    symbols: [
      { id: 'i', g: 'i', ex: 'sit' }, { id: 'n', g: 'n', ex: 'nose' },
      { id: 'm', g: 'm', ex: 'milk' }, { id: 'd', g: 'd', ex: 'dog' },
    ],
    tricky: [],
    words: [
      { w: 'in', gpc: ['i', 'n'], listen: 'word|in|tpr-put' },
      { w: 'sit', gpc: ['s', 'i', 't'], listen: 'verb|sit|tpr-do' },
      { w: 'dad', gpc: ['d', 'a', 'd'], listen: 'word|dad|listen-pick' },
    ],
  },
  {
    id: 'h03', era: 'letter1', ar: 'ح٣',
    symbols: [
      { id: 'g', g: 'g', ex: 'goat' }, { id: 'o', g: 'o', ex: 'dog' },
      { id: 'c', g: 'c', ex: 'cat' }, { id: 'k', g: 'k', ex: 'kite' },
    ],
    tricky: ['the', 'to'],
    words: [
      { w: 'cat', gpc: ['c', 'a', 't'], listen: 'word|cat|listen-pick' },
      { w: 'dog', gpc: ['d', 'o', 'g'], listen: 'word|dog|listen-pick' },
      { w: 'on', gpc: ['o', 'n'], listen: 'word|on|tpr-put' },
    ],
  },
  {
    id: 'h04', era: 'letter1', ar: 'ح٤',
    symbols: [
      { id: 'ck', g: 'ck', ex: 'duck' }, { id: 'e', g: 'e', ex: 'bed' },
      { id: 'u', g: 'u', ex: 'mum' }, { id: 'r', g: 'r', ex: 'red' },
    ],
    tricky: ['no', 'go'],
    words: [
      { w: 'duck', gpc: ['d', 'u', 'ck'], listen: 'word|duck|listen-pick' },
      { w: 'sock', gpc: ['s', 'o', 'ck'], listen: 'word|sock|listen-pick' },
      { w: 'red', gpc: ['r', 'e', 'd'], listen: 'word|red|listen-pick' },
      { w: 'run', gpc: ['r', 'u', 'n'], listen: 'verb|run|tpr-do' },
      { w: 'mum', gpc: ['m', 'u', 'm'], listen: 'word|mum|listen-pick' },
      { w: 'pen', gpc: ['p', 'e', 'n'], listen: 'word|pen|listen-pick' },
      { w: 'sun', gpc: ['s', 'u', 'n'], listen: 'word|sun|listen-pick' },
    ],
  },
  {
    id: 'h05', era: 'letter1', ar: 'ح٥',
    symbols: [
      { id: 'h', g: 'h', ex: 'hat' }, { id: 'b', g: 'b', ex: 'bed' },
      { id: 'f', g: 'f', ex: 'fish' }, { id: 'ff', g: 'ff', ex: 'off' },
      { id: 'l', g: 'l', ex: 'leg' }, { id: 'll', g: 'll', ex: 'bell' },
      { id: 'ss', g: 'ss', ex: 'grass' },
    ],
    tricky: ['I'],
    words: [
      { w: 'hat', gpc: ['h', 'a', 't'], listen: 'word|hat|listen-pick' },
      { w: 'bed', gpc: ['b', 'e', 'd'], listen: 'word|bed|listen-pick' },
      { w: 'leg', gpc: ['l', 'e', 'g'], listen: 'word|leg|listen-pick' },
      { w: 'big', gpc: ['b', 'i', 'g'], listen: 'word|big|tpr-two' },
    ],
  },
  {
    id: 'h06', era: 'letter2', ar: 'ح٦',
    symbols: [
      { id: 'j', g: 'j', ex: 'jump' }, { id: 'v', g: 'v', ex: 'very' },
      { id: 'w', g: 'w', ex: 'window' }, { id: 'x', g: 'x', ex: 'box' },
    ],
    tricky: ['he', 'she'],
    words: [{ w: 'box', gpc: ['b', 'o', 'x'], listen: 'word|box|listen-pick' }],
  },
  {
    id: 'h07', era: 'letter2', ar: 'ح٧',
    symbols: [
      { id: 'y', g: 'y', ex: 'yellow' }, { id: 'z', g: 'z', ex: 'zebra' },
      { id: 'zz', g: 'zz', ex: 'buzz' }, { id: 'qu', g: 'qu', ex: 'queen' },
    ],
    tricky: ['we', 'me', 'be'],
    words: [],
  },
  {
    id: 'h08', era: 'letter2', ar: 'ح٨',
    symbols: [
      { id: 'ch', g: 'ch', ex: 'chip' }, { id: 'sh', g: 'sh', ex: 'shop' },
      { id: 'th', g: 'th', ex: 'thin' }, { id: 'ng', g: 'ng', ex: 'ring' },
    ],
    tricky: ['was', 'my'],
    words: [
      { w: 'fish', gpc: ['f', 'i', 'sh'], listen: 'word|fish|listen-pick' },
      { w: 'ship', gpc: ['sh', 'i', 'p'], listen: 'word|ship|listen-pick' },
      { w: 'shell', gpc: ['sh', 'e', 'll'], listen: 'word|shell|listen-pick' },
    ],
  },
  {
    id: 'h09', era: 'letter2', ar: 'ح٩',
    symbols: [
      { id: 'ai', g: 'ai', ex: 'rain' }, { id: 'ee', g: 'ee', ex: 'feet' },
      { id: 'igh', g: 'igh', ex: 'night' }, { id: 'oa', g: 'oa', ex: 'boat' },
    ],
    tricky: ['you'],
    words: [
      { w: 'sheep', gpc: ['sh', 'ee', 'p'], listen: 'word|sheep|listen-pick' },
      { w: 'bee', gpc: ['b', 'ee'], listen: 'word|bee|listen-pick' },
      { w: 'goat', gpc: ['g', 'oa', 't'], listen: 'word|goat|listen-pick' },
    ],
  },
  {
    id: 'h10', era: 'letter2', ar: 'ح١٠',
    symbols: [
      { id: 'oo', g: 'oo', ex: 'boot' }, { id: 'oo-book', g: 'oo', ex: 'look' },
      { id: 'ar', g: 'ar', ex: 'farm' }, { id: 'or', g: 'or', ex: 'for' },
    ],
    tricky: ['they', 'her'],
    words: [
      { w: 'car', gpc: ['c', 'ar'], listen: 'word|car|listen-pick' },
      { w: 'book', gpc: ['b', 'oo-book', 'k'], listen: 'word|book|listen-pick' },
      { w: 'foot', gpc: ['f', 'oo-book', 't'], listen: 'word|foot|listen-pick' },
    ],
  },
  {
    id: 'h11', era: 'letter2', ar: 'ح١١',
    symbols: [
      { id: 'ur', g: 'ur', ex: 'hurt' }, { id: 'ow', g: 'ow', ex: 'cow' },
      { id: 'oi', g: 'oi', ex: 'coin' }, { id: 'er', g: 'er', ex: 'corner' },
    ],
    tricky: ['all', 'are'],
    words: [{ w: 'cow', gpc: ['c', 'ow'], listen: 'word|cow|listen-pick' }],
  },
  {
    id: 'h12', era: 'letter2', ar: 'ح١٢',
    symbols: [
      { id: 'ear', g: 'ear', ex: 'dear' }, { id: 'air', g: 'air', ex: 'fair' },
      { id: 'ure', g: 'ure', ex: 'sure' },
    ],
    tricky: [],
    words: [
      { w: 'ear', gpc: ['ear'], listen: 'word|ear|listen-pick' },
      { w: 'chair', gpc: ['ch', 'air'], listen: 'word|chair|listen-pick' },
    ],
  },
  {
    // **ولا رمزَ جديداً في ح١٣**: `METHOD.md §٥` («العناقيد بلا رموزٍ جديدة») —
    // الجديدُ أن يتجاور ساكنان، وهو علاجُ إقحام الحركة العربيّ (س٣-٤ سمعاً قبله).
    id: 'h13', era: 'letter3', ar: 'ح١٣', clusters: true,
    // **الصائتُ الأوسط** (`METHOD.md §٨` — شكلُ `haraka`): موضعُه ههنا بنصّ بند
    // الجلسة ٦ في `SESSIONS.md`، وقد صارت الحركاتُ الخمس كلُّها مفكوكةً قبله بعهدين
    // (a في ح١ · i في ح٢ · o في ح٣ · e وu في ح٤) — فيُسأل عن أوسطها في كلمةٍ تُقرأ.
    vowelPairs: ['a-i', 'e-o', 'i-u'],
    symbols: [],
    tricky: ['said', 'so', 'have', 'like', 'some', 'come', 'were', 'there',
      'little', 'one', 'do', 'when', 'out', 'what'],
    words: [
      { w: 'hand', gpc: ['h', 'a', 'n', 'd'], listen: 'word|hand|listen-pick' },
      { w: 'jump', gpc: ['j', 'u', 'm', 'p'], listen: 'verb|jump|tpr-do' },
      { w: 'stand', gpc: ['s', 't', 'a', 'n', 'd'], listen: 'verb|stand|tpr-do' },
      { w: 'clap', gpc: ['c', 'l', 'a', 'p'], listen: 'verb|clap|tpr-do' },
      { w: 'milk', gpc: ['m', 'i', 'l', 'k'], listen: 'word|milk|listen-pick' },
      { w: 'frog', gpc: ['f', 'r', 'o', 'g'], listen: 'word|frog|listen-pick' },
      { w: 'green', gpc: ['g', 'r', 'ee', 'n'], listen: 'word|green|listen-pick' },
      { w: 'tree', gpc: ['t', 'r', 'ee'], listen: 'word|tree|listen-pick' },
      { w: 'stop', gpc: ['s', 't', 'o', 'p'], listen: 'word|stop|listen-pick' },
      { w: 'black', gpc: ['b', 'l', 'a', 'ck'], listen: 'word|black|listen-pick' },
      { w: 'small', gpc: ['s', 'm', 'a', 'll'], listen: 'word|small|tpr-two' },
      { w: 'swim', gpc: ['s', 'w', 'i', 'm'], listen: 'verb|swim|listen-pick' },
      { w: 'sleep', gpc: ['s', 'l', 'ee', 'p'], listen: 'verb|sleep|listen-pick' },
      { w: 'under', gpc: ['u', 'n', 'd', 'er'], listen: 'word|under|tpr-put' },
      { w: 'flower', gpc: ['f', 'l', 'ow', 'er'], listen: 'word|flower|listen-pick' },
      { w: 'brown', gpc: ['b', 'r', 'ow', 'n'], listen: 'word|brown|listen-pick' },
      { w: 'spider', gpc: ['s', 'p', 'i', 'd', 'er'], listen: 'word|spider|listen-pick' },
    ],
  },
  {
    id: 'h14', era: 'letter4', ar: 'ح١٤',
    symbols: [
      { id: 'ay', g: 'ay', ex: 'day' }, { id: 'ou', g: 'ou', ex: 'out' },
      { id: 'ie', g: 'ie', ex: 'tie' }, { id: 'ea', g: 'ea', ex: 'eat' },
      { id: 'oy', g: 'oy', ex: 'boy' }, { id: 'ir', g: 'ir', ex: 'girl' },
      { id: 'ue', g: 'ue', ex: 'blue' }, { id: 'aw', g: 'aw', ex: 'saw' },
    ],
    tricky: ['oh', 'their', 'people', 'Mr', 'Mrs', 'looked', 'called', 'asked'],
    words: [
      { w: 'eat', gpc: ['ea', 't'], listen: 'verb|eat|listen-pick' },
      { w: 'sea', gpc: ['s', 'ea'], listen: 'word|sea|listen-pick' },
      { w: 'read', gpc: ['r', 'ea', 'd'], listen: 'verb|read|listen-pick' },
      { w: 'blue', gpc: ['b', 'l', 'ue'], listen: 'word|blue|listen-pick' },
      { w: 'boy', gpc: ['b', 'oy'], listen: 'word|boy|listen-pick' },
      { w: 'mouth', gpc: ['m', 'ou', 'th'], listen: 'word|mouth|listen-pick' },
      { w: 'girl', gpc: ['g', 'ir', 'l'], listen: 'word|girl|listen-pick' },
      { w: 'bird', gpc: ['b', 'ir', 'd'], listen: 'word|bird|listen-pick' },
    ],
  },
  {
    id: 'h15', era: 'letter4', ar: 'ح١٥',
    symbols: [
      { id: 'wh', g: 'wh', ex: 'when' }, { id: 'ph', g: 'ph', ex: 'photo' },
      { id: 'ew', g: 'ew', ex: 'new' }, { id: 'oe', g: 'oe', ex: 'toe' },
      { id: 'au', g: 'au', ex: 'Paul' }, { id: 'a-e', g: 'a-e', ex: 'make' },
      { id: 'e-e', g: 'e-e', ex: 'these' }, { id: 'i-e', g: 'i-e', ex: 'like' },
      { id: 'o-e', g: 'o-e', ex: 'home' }, { id: 'u-e', g: 'u-e', ex: 'rule' },
    ],
    tricky: ['water', 'where', 'who', 'again', 'thought', 'through', 'work',
      'mouse', 'many'],
    words: [
      { w: 'nose', gpc: ['n', 'o-e', 's'], listen: 'word|nose|listen-pick' },
      { w: 'white', gpc: ['wh', 'i-e', 't'], listen: 'word|white|listen-pick' },
      { w: 'shoe', gpc: ['sh', 'oe'], listen: 'word|shoe|listen-pick' },
      { w: 'plane', gpc: ['p', 'l', 'a-e', 'n'], listen: 'word|plane|listen-pick' },
      { w: 'grape', gpc: ['g', 'r', 'a-e', 'p'], listen: 'word|grape|listen-pick' },
      { w: 'bike', gpc: ['b', 'i-e', 'k'], listen: 'word|bike|listen-pick' },
      { w: 'kite', gpc: ['k', 'i-e', 't'], listen: 'word|kite|listen-pick' },
      { w: 'phone', gpc: ['ph', 'o-e', 'n'], listen: 'word|phone|listen-pick' },
    ],
  },
  {
    // **نطوقٌ بديلة لرموزٍ معلومة** (L&S ص١٣٥) — ولا رسمَ جديداً: المعرّفُ `-alt`
    // والرسمُ نفسُه، فيُقاس تعلُّمُ النطق الثاني ولا يُخلَط بالأول.
    id: 'h16', era: 'letter4', ar: 'ح١٦',
    symbols: [
      { id: 'ow-alt', g: 'ow', ex: 'yellow', alt: 'cow' },
      { id: 'ea-alt', g: 'ea', ex: 'bread', alt: 'eat' },
      { id: 'ch-alt', g: 'ch', ex: 'school', alt: 'chip' },
      { id: 'y-alt', g: 'y', ex: 'family', alt: 'yellow' },
    ],
    tricky: ['laughed', 'because', 'different', 'any', 'eyes', 'friends',
      'once', 'please'],
    words: [
      { w: 'yellow', gpc: ['y', 'e', 'll', 'ow-alt'], listen: 'word|yellow|listen-pick' },
      { w: 'bread', gpc: ['b', 'r', 'ea-alt', 'd'], listen: 'word|bread|listen-pick' },
      { w: 'school', gpc: ['s', 'ch-alt', 'oo', 'l'], listen: 'word|school|listen-pick' },
      { w: 'family', gpc: ['f', 'a', 'm', 'i', 'l', 'y-alt'], listen: 'word|family|listen-pick' },
    ],
  },
];

/**
 * ————— **الشائكاتُ بطريقة heart words** (`METHOD.md §٥`) —————
 *
 * «شائكاتُها المعدودة إن وُجدت بطريقة heart words (فكُّ المنتظم ووسمُ الشوكة)»،
 * و`§١٢-١`: «كلُّ شائكةٍ **مفكوكةٌ إلا موضعَ شوكتها**». فلكلِّ شائكةٍ **مقاطعُ رسمها**
 * و**موضعُ شوكتها** — وهما بيانٌ يُكتب، لأنّ الشوكة لا تُستنتَج من الرسم: في `to`
 * الشوكةُ `o` (تقول ‏/oo/ لا ‏/o/)، وفي `the` الشوكةُ `e` (تقول شوَا)، وفي `I` الكلمةُ
 * كلُّها شوكة.
 *
 * **والوسمُ يُحسَب بدرجة المحطة لا يُكتب هنا** (`markedTricky` أدناه): المقطعُ يُنقَّط
 * **إن كان رمزُه مفتوحاً عند تلك الدرجة** — فـ`th` في `the` عند ح٣ لا نقطةَ له (رمزُه
 * يُفتَح في ح٨) وله نقطةٌ يومَ يُفتَح. ولو كُتب الوسمُ بياناً ثابتاً لَكذب على الطفل
 * في إحدى الدرجتين: «هذا تفكّه» وهو لم يتعلّمه بعد.
 *
 * **ولا تدخل مقاطعُ الشائكة جردَ الرموز**: هي الخرقُ المعلَن الوحيد للمفكوكية
 * (`METHOD.md §١٢-١`) بميزانيةٍ معدودة — فتُجرَد **شائكةً** على ميزانيتها، لا رسوماً
 * على السلّم (وإلّا لَاستحال تدريسُ `the` عند ح٣ أبداً).
 *
 * **ولكلٍّ سياقٌ مسموعٌ مألوف** (`say` — نصُّ `METHOD.md §٦`: «وتُدرَّس داخل سياقٍ
 * مسموعٍ مألوف (‏the cat…) لا معزولةً»): كلماتُه كلُّها مداخلُ Starters يجردها
 * `check_range` كما يجرد الأمرَ المنطوق، فلا يدخل أذنَ الطفل ما ليس من قائمته.
 */
export const HEART_WORDS = {
  the: { parts: ['th', 'e'], heart: 1, say: 'the cat' },
  to: { parts: ['t', 'o'], heart: 1, say: 'go to bed' },
  no: { parts: ['n', 'o'], heart: 1, say: 'no, it is not a dog' },
  go: { parts: ['g', 'o'], heart: 1, say: 'go to the door' },
  I: { parts: ['I'], heart: 0, say: 'I can run' },
};

/**
 * **الرموزُ الصائتة** — قائمةٌ مُعلَنة لا تُشتقّ من شكل الرسم.
 *
 * وعلّةُ وجودها بابٌ في الفاحص: **المرحلةُ ٤ (ح١٣) لا رمزَ جديدَ فيها**، وإنما
 * الجديدُ أن **يتجاور ساكنان** (CVCC/CCVC — `METHOD.md §٥`). فبلا معرفةِ الصائت من
 * الساكن يُحسَب `stand` مفكوكاً عند ح٢ (رموزُه كلُّها مفتوحة هناك) وهو إنّما يُفكّ
 * عند ح١٣ — وذلك عينُ ما يُقحِم الحركةَ العربيةَ في العنقود (علّةُ س٣-٤).
 */
export const VOWEL_SYMBOLS = new Set([
  'a', 'e', 'i', 'o', 'u',
  'ai', 'ee', 'igh', 'oa', 'oo', 'oo-book', 'ar', 'or',
  'ur', 'ow', 'oi', 'er', 'ear', 'air', 'ure',
  'ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw',
  'ew', 'oe', 'au', 'a-e', 'e-e', 'i-e', 'o-e', 'u-e',
  // ونطوقُ ح١٦: `ow` في yellow صائتٌ كأصله، و`ea` في bread كذلك، و`y` في family
  // صائتٌ (‏/i/) وإن كان `y` في yellow ساكناً (‏/j/) — وهو عينُ سبب تفريق المعرّفات.
  'ow-alt', 'ea-alt', 'y-alt',
]);

/**
 * درجةُ العناقيد — التي تفتح تجاورَ الساكنين (وتُعلن `clusters: true`).
 *
 * **والقاعدةُ نفسُها ليست هنا بل في `check_range.py` وحدَه**: هذه بياناتٌ (أيُّ رمزٍ
 * صائتٌ، وأيُّ درجةٍ تفتح التجاور) وتلك حكمٌ يُطبَّق عليها — ولو كُتب الحكمُ في
 * الموضعين لصار للحقيقة مصدران يفترقان بلا حارس.
 */
export const CLUSTER_GRADE = 'h13';

// ————————————————————————————————————————————————————————————————————————
// ٤ب) أصواتُ اللغة — **الرمزُ رسمٌ والصوتُ مهارة** (مادّةُ س٣ وس٤)
// ————————————————————————————————————————————————————————————————————————
//
// **العلّة، وهي علّةُ س٤ نفسِها**: «الأذنُ الفونيمية … بلا حرفٍ مرسوم إطلاقاً»
// (`METHOD.md §٤`) — والسؤالُ فيها «أيُّ الصور تبدأ بـ/s/؟» سؤالٌ عن **صوت**، فلو
// جُمعت الكلماتُ برسمها لَصار `cat` و`kite` صوتَين مختلفين وهما صوتٌ واحد، ولَصار
// `kite` **جواباً صحيحاً** في سؤالٍ عن مدىً آخر — خطأٌ لا يُمسَك بحارس رسم.
//
// فهذا جدولُ **الأربعة والأربعين صوتاً** بمجموعات L&S (وثيقة 00281-2007 — جدولُ
// الفونيمات وبدائلُ رسومها في المرحلة ٥، ص١٣٤–١٣٥): لكلِّ صوتٍ **رسومُه** التي
// تُنطَق به. ومنه يُشتقّ صوتُ كل رمزٍ في السلّم، فلا رمزَ بلا صوت (يحرسه
// `check_range.py`).
//
// **و`say` نصُّه المنطوق** — وهو مفتاحُ ملفّه في قائمة الصوت (`docs/AUDIO_QUEUE.md`،
// الفئة `phoneme`: «الأصواتُ المعزولة `/s/ /a/ /t/`»)، فيلزم أن يكون **فريداً**: نصّان
// متطابقان يتقاسمان ملفاً واحداً فيُسمع صوتٌ مكانَ صوت. **والرسمُ الحرفيّ يشترك فيه
// صوتان** (`oo` في boot غيرُها في book — نصُّ L&S ص٧٤)، فأُفرد الثاني بعلامته الصوتية
// الدولية `/ʊ/` وحدَه: استثناءٌ واحد معلَنٌ بعلّته، لا لسانٌ ثانٍ في الجدول.
//
// **ونقاءُ نطق الصوت المعزول شأنُ جلسة ص** (`SESSIONS.md`): البنكُ غيرُ مولَّد،
// والاحتياطُ الناطق قد يلفظ **اسمَ الحرف** لا صوتَه — نقصُ نقاءٍ معلومٌ مقبولٌ
// مؤقتاً، لا يُجتهَد في حلّه بتوليد صوتٍ هنا (عهدُ `AUDIO_QUEUE.md`).

export const PHONEMES = [
  // الصوامتُ الأربعةُ والعشرون
  { id: 's', say: '/s/', ex: 'sun', graphemes: ['s', 'ss'] },
  { id: 't', say: '/t/', ex: 'tree', graphemes: ['t'] },
  { id: 'p', say: '/p/', ex: 'pen', graphemes: ['p'] },
  { id: 'n', say: '/n/', ex: 'nose', graphemes: ['n'] },
  { id: 'm', say: '/m/', ex: 'mum', graphemes: ['m'] },
  { id: 'd', say: '/d/', ex: 'dog', graphemes: ['d'] },
  { id: 'g', say: '/g/', ex: 'goat', graphemes: ['g'] },
  { id: 'k', say: '/k/', ex: 'cat', graphemes: ['c', 'k', 'ck', 'ch-alt'] },
  { id: 'r', say: '/r/', ex: 'red', graphemes: ['r'] },
  { id: 'h', say: '/h/', ex: 'hat', graphemes: ['h'] },
  { id: 'b', say: '/b/', ex: 'bed', graphemes: ['b'] },
  { id: 'f', say: '/f/', ex: 'fish', graphemes: ['f', 'ff', 'ph'] },
  { id: 'l', say: '/l/', ex: 'leg', graphemes: ['l', 'll'] },
  { id: 'j', say: '/j/', ex: 'jump', graphemes: ['j'] },
  { id: 'v', say: '/v/', ex: 'very', graphemes: ['v'] },
  { id: 'w', say: '/w/', ex: 'white', graphemes: ['w', 'wh'] },
  { id: 'ks', say: '/ks/', ex: 'box', graphemes: ['x'] },
  { id: 'y', say: '/y/', ex: 'yellow', graphemes: ['y'] },
  { id: 'z', say: '/z/', ex: 'zebra', graphemes: ['z', 'zz'] },
  { id: 'kw', say: '/kw/', ex: 'queen', graphemes: ['qu'] },
  { id: 'ch', say: '/ch/', ex: 'chair', graphemes: ['ch'] },
  { id: 'sh', say: '/sh/', ex: 'ship', graphemes: ['sh'] },
  { id: 'th', say: '/th/', ex: 'mouth', graphemes: ['th'] },
  { id: 'ng', say: '/ng/', ex: 'ring', graphemes: ['ng'] },
  // الصوائتُ العشرون
  { id: 'a', say: '/a/', ex: 'cat', graphemes: ['a'] },
  { id: 'e', say: '/e/', ex: 'bed', graphemes: ['e', 'ea-alt'] },
  { id: 'i', say: '/i/', ex: 'fish', graphemes: ['i'] },
  { id: 'o', say: '/o/', ex: 'dog', graphemes: ['o'] },
  { id: 'u', say: '/u/', ex: 'duck', graphemes: ['u'] },
  { id: 'ai', say: '/ai/', ex: 'plane', graphemes: ['ai', 'ay', 'a-e'] },
  { id: 'ee', say: '/ee/', ex: 'sheep', graphemes: ['ee', 'ea', 'e-e', 'y-alt'] },
  { id: 'igh', say: '/igh/', ex: 'white', graphemes: ['igh', 'ie', 'i-e'] },
  { id: 'oa', say: '/oa/', ex: 'goat', graphemes: ['oa', 'oe', 'o-e', 'ow-alt'] },
  { id: 'oo', say: '/oo/', ex: 'blue', graphemes: ['oo', 'ue', 'ew', 'u-e'] },
  // **الاستثناءُ المعلَن** (رأسُ الجدول): رسمُه رسمُ أخيه، فنصُّه المنطوق علامتُه الدولية
  { id: 'oo-book', say: '/ʊ/', ex: 'book', graphemes: ['oo-book'] },
  { id: 'ar', say: '/ar/', ex: 'car', graphemes: ['ar'] },
  { id: 'or', say: '/or/', ex: 'for', graphemes: ['or', 'aw', 'au'] },
  { id: 'ur', say: '/ur/', ex: 'girl', graphemes: ['ur', 'ir'] },
  { id: 'er', say: '/er/', ex: 'spider', graphemes: ['er'] },
  { id: 'ow', say: '/ow/', ex: 'cow', graphemes: ['ow', 'ou'] },
  { id: 'oi', say: '/oi/', ex: 'boy', graphemes: ['oi', 'oy'] },
  { id: 'ear', say: '/ear/', ex: 'ear', graphemes: ['ear'] },
  { id: 'air', say: '/air/', ex: 'chair', graphemes: ['air'] },
  { id: 'ure', say: '/ure/', ex: 'sure', graphemes: ['ure'] },
];

/** رسمٌ ← صوتُه (يُبنى مرّةً من الجدول أعلاه — ولا خريطةَ ثانية تُكتب بيد). */
const SOUND_OF_SYMBOL = new Map(
  PHONEMES.flatMap((p) => p.graphemes.map((g) => [g, p.id])));

/** صوتُ رمزٍ بمعرّفه، أو `null` — يقرؤه `check_range` فيمسك رمزاً بلا صوت. */
export const phonemeOf = (symbolId) => SOUND_OF_SYMBOL.get(symbolId) || null;

/** **نصُّ الصوت المنطوق** (`/s/`) — وهو مفتاحُ ملفّه في قائمة الصوت. */
export const phonemeSay = (id) => PHONEMES.find((p) => p.id === id)?.say || '';

/** أصائتٌ هذا الصوت؟ — يُقرأ من `VOWEL_SYMBOLS` لا يُعلَن ثانيةً (مصدرٌ واحد). */
export const isVowelSound = (id) =>
  (PHONEMES.find((p) => p.id === id)?.graphemes || []).some((g) => VOWEL_SYMBOLS.has(g));

/** كلمةُ القراءة ← مقاطعُها (تُبنى مرّةً — وهي الطريقُ الوحيد إلى أصوات الكلمة). */
const GPC_OF_WORD = new Map(GRADES.flatMap((g) => g.words.map((w) => [w.w, w.gpc])));

/**
 * **أصواتُ كلمةٍ** بمعرّفاتها، أو `null` لكلمةٍ لا مقاطعَ لها في السلّم.
 *
 * **ومقاطعُ الرسم مادّةُ صوتٍ هنا لا مادّةَ قراءة**: س٤ سمعيةٌ خالصة ولا يُعرَض فيها
 * رسمٌ (`METHOD.md §٤`) — وإنّما تُقرأ من `gpc` **بنيةُ الكلمة الصوتية** وحدَها،
 * فلا يعرف الطفلُ أنّ ثَمَّ رسماً أصلاً. وهي الوصلةُ التي تجعل «أوّلَ الصوت» دقيقاً:
 * `cat` و`kite` صوتُهما الأولُ واحد وإن اختلف رسمُهما.
 */
export function soundsOf(word) {
  const gpc = GPC_OF_WORD.get(String(word));
  if (!gpc) return null;
  const sounds = gpc.map(phonemeOf);
  return sounds.some((s) => !s) ? null : sounds;
}

/**
 * **قافيةُ كلمة** (rime): من أوّل صائتٍ فيها إلى آخرها — `cat` ⇒ `at`، و`duck` ⇒ `uk`.
 * **وهي أصواتٌ لا رسوم**، فـ`duck` و`sock` تتقافيان وإن اختلف رسمُ آخرهما.
 */
export function rimeOf(word) {
  const sounds = soundsOf(word);
  if (!sounds) return null;
  const at = sounds.findIndex(isVowelSound);
  return at < 0 ? null : sounds.slice(at).join('');
}

/** الدرجاتُ حتى هذه الدرجة ضمناً — عليها تُبنى الجبهاتُ كلُّها. */
export function gradesUpTo(gradeId) {
  const end = GRADES.findIndex((g) => g.id === gradeId);
  return end < 0 ? [] : GRADES.slice(0, end + 1);
}

/** معرّفاتُ الرموز المفتوحة عند درجةٍ ما (الحقلُ `symbols` من جبهة المحطة). */
export const symbolsUpTo = (gradeId) =>
  gradesUpTo(gradeId).flatMap((g) => g.symbols.map((s) => s.id));

/** الشائكاتُ المفتوحة عند درجةٍ ما — تراكمياً كما في `METHOD.md §٥`. */
export const trickyUpTo = (gradeId) => gradesUpTo(gradeId).flatMap((g) => g.tricky);

/** كلماتُ القراءة المفكوكة عند درجةٍ ما — حوضُ تمارينها (`build` و`decode`). */
export const wordsUpTo = (gradeId) => gradesUpTo(gradeId).flatMap((g) => g.words);

/** رمزٌ بمعرّفه (لعرضه ولوصفه في لوحة الوالد). */
export const symbolById = (id) =>
  GRADES.flatMap((g) => g.symbols).find((s) => s.id === id) || null;

/**
 * ————— **قيدُ الاقتران: البابُ الوحيد إلى كلمات القراءة** (`METHOD.md §٦`) —————
 *
 * «لا يدخل تمرينَ قراءةٍ (decode/build/text) كلمةٌ لم تبلغ **صندوقَ الإتقان** في
 * مفتاحها السمعيّ» — والفخُّ المُغلَق بها: «فكٌّ بلا معنى»، طفلٌ ينطق `sat` ولا يعرفها.
 *
 * **ولِمَ دالّةٌ لا قائمة؟** لأنّ القيدَ إن كان قاعدةً تُذكَر نُسي، وإن كان بنيةً لم
 * يُنسَ. فليس في هذه الوحدة طريقٌ آخرُ إلى كلمات القراءة: `wordsUpTo` حوضُ المنهج
 * (يقرؤه الفاحصُ ليجرد الرموز)، **وهذه** هي التي يبني منها المولّد — وهي **تأبى أن
 * تُستدعى بلا سؤال ليتنر**: مَن لم يمرّر دالّةَ الإتقان لم يحصل على كلمةٍ واحدة، ولا
 * يمرّ ذلك صامتاً بقائمةٍ فارغة بل يُرمى خطأً يُوقف الشاشة عند أوّل تجربة.
 *
 * ويثبت `tools/check_coupling.mjs` الأمرين معاً: أنّ كلَّ كلمةٍ تُعلن مفتاحَها وأنّ
 * المفتاحَ موجودٌ في الرصيد، وأنّ **كلمةً دون `MASTERED_BOX` سمعاً لا تخرج من هنا
 * أبداً** — محاكاةً بحالة ليتنر مصنوعة.
 *
 * @param {string} gradeId درجةُ المحطة (`h05`)
 * @param {(key: string) => boolean} isMastered `progress.isMastered` أو نظيرتُها
 */
export function readableAt(gradeId, isMastered) {
  if (typeof isMastered !== 'function') {
    throw new TypeError('readableAt: قيدُ الاقتران يحتاج دالّةَ الإتقان '
      + '(`progress.isMastered`) — ولا كلمةَ قراءةٍ تخرج بلا سؤال ليتنر');
  }
  return wordsUpTo(gradeId).filter((word) => isMastered(word.listen));
}

/**
 * **والشائكاتُ لا يحكمها قيدُ الاقتران، بعلّةٍ لا بإهمال**: هي كلماتُ وظيفةٍ عاليةُ
 * التواتر (`the` · `was` · `they`) لا معنى مصوَّرَ لها ولا محطةَ سمعية — يسمعها
 * الطفلُ في كل جملةٍ توجَّه إليه، وحدُّها **ميزانيةٌ معدودة** لا صندوقُ إتقان
 * (`METHOD.md §١٢-١`). ونصُّ §٦ نفسُه يحصر القيد في `decode/build/text`.
 */
export const trickyAt = (gradeId) => trickyUpTo(gradeId);

/**
 * **شائكةٌ موسومةٌ بدرجتها**: مقاطعُ رسمها ولكلٍّ وسمُه —
 * `heart` موضعُ الشوكة · `dot` مقطعٌ رمزُه مفتوحٌ عند هذه الدرجة فيُفكّ · `''` سواهما.
 *
 * **علامةٌ لا نصٌّ شارح** (بندُ الجلسة ٤): الطفلُ قبل-قارئ بلغتين، فلا تُكتب له
 * «هذا الحرفُ شاذّ» — تُرسَم تحت المقطع علامةٌ يتعلّمها في النمذجة.
 */
export function markedTricky(word, gradeId) {
  const shape = HEART_WORDS[word];
  if (!shape) return null;
  const open = new Set(symbolsUpTo(gradeId));
  return {
    w: word,
    say: shape.say,
    parts: shape.parts.map((g, at) => ({
      g,
      mark: at === shape.heart ? 'heart' : open.has(g) ? 'dot' : '',
    })),
  };
}

// ————————————————————————————————————————————————————————————————————————
// ٥) مسارا الرحلة ومحطاتُها
// ————————————————————————————————————————————————————————————————————————

/**
 * **مسارا الرحلة** (`METHOD.md §١`) — جبهتان مستقلتان في ليتنر، يربطهما قيدُ
 * الاقتران كلمةً كلمة. وترتيبُهما على الخريطة يفرضه `sections()`.
 */
export const TRACKS = [
  {
    id: 'listen',
    title: 'مسارُ السمع',
    sub: 'يفهم الإنكليزيةَ المسموعة ويستجيب لها',
    accent: 'var(--accent-listen)',
    stages: ['listen1', 'listen2', 'listen3', 'listen4', 'listen5'],
  },
  {
    id: 'letter',
    title: 'مسارُ الحرف',
    sub: 'يفكّ المكتوبَ بسلّمٍ شبه مفكوك',
    accent: 'var(--accent-letter)',
    stages: ['letter1', 'letter2', 'letter3', 'letter4'],
  },
];

/** مراحلُ مسار السمع الخمس (`METHOD.md §٤`) — ولكلٍّ محطاتُها بحقلها ومفاتيحها. */
const LISTEN_STAGES = [
  {
    id: 'listen1', ar: 'س١ — افهم والمس', sub: 'كلمةٌ تُسمَع وصورةٌ تُلمَس',
    type: 'quiz', face: '👂',
    parts: [
      { part: 's1-1', title: 'الأهل', field: 'family', face: '👨‍👩‍👧‍👦' },
      { part: 's1-2', title: 'الجسد والوجه', field: 'body', face: '👁️' },
      { part: 's1-3', title: 'الحيوانات', field: 'animals', face: '🐈' },
      { part: 's1-4', title: 'الطعام والشراب', field: 'food', face: '🍎' },
      // **والألوانُ نمطُها `swatch`**: تسعٌ مربّعاتُها في يونيكود، وثنتان بقعتان
      // مُصيَّرتان بقيمة لونهما (حكمُ المدير — رأسُ الرصيد المصوَّر أعلاه).
      { part: 's1-5', title: 'الألوان', field: 'colours', face: '🟥', pictures: 'swatch' },
      { part: 's1-6', title: 'الأعداد سمعاً', field: 'numbers', face: '🔵', pictures: 'count' },
    ],
  },
  {
    id: 'listen2', ar: 'س٢ — اسمع ونفّذ', sub: 'أمرٌ يُسمَع وفعلٌ يُنفَّذ',
    type: 'tpr', face: '✋',
    // **والأمرُ المنطوق مادّةُ منهجٍ لا نصُّ شاشة** (`METHOD.md §٣`: «ولا كلمةَ في
    // تمرينٍ خارجه»): `order` قالبُ الأمر بالإنكليزية، و`{w}` موضعُ الكلمة منه.
    // فمن أراد أن يعرف ما يُقال للطفل قرأه هنا، ومنه تُستخرَج نصوصُ قائمة الصوت.
    parts: [
      { part: 's2-1', title: 'المس ما تسمع', field: 'animals', face: '✋', kind: 'tpr-do',
        order: 'point to the {w}', from: ['cat', 'dog', 'fish', 'bird', 'duck', 'frog'] },
      { part: 's2-2', title: 'أين أضعه؟', field: 'places', face: '📦', kind: 'tpr-put',
        pictures: 'scene', props: ['apple', 'box'], order: 'put the apple {w} the box' },
      { part: 's2-3', title: 'افعل مثلي', field: 'verbs', face: '🏃', kind: 'tpr-do',
        pictures: 'act', order: '{w}' },
      { part: 's2-4', title: 'أمرٌ من شيئين', field: 'school', face: '🟩', kind: 'tpr-two',
        pictures: 'scene', props: ['ball'], order: 'point to the {size} {colour} ball',
        from: ['big', 'small'], colours: ['red', 'blue', 'green', 'yellow'] },
    ],
  },
  {
    // **صورةُ الزوج بالبيانات لا باليد** (رأسُ `pairMode` أدناه): الزوجُ مصوَّرٌ حيث
    // **كلتا** كلمتيه في الرصيد المصوَّر بصورةٍ مفردة، وإلّا فتمييزٌ صوتيٌّ خالص —
    // وهو حكمُ f/v المقيَّد في `METHOD.md §٤` **معمَّماً بالبيانات** لا مكتوباً لزوج.
    id: 'listen3', ar: 'س٣ — ميّز الزوجين', sub: 'زوجان يُسمَعان ويُميَّزان',
    type: 'contrast', face: '🔀',
    parts: [
      { part: 's3-1', title: 'p و b', face: '🍐', pairs: [
        { key: 'p-b', phonemes: ['p', 'b'], words: ['pear', 'bear'] }] },
      { part: 's3-2', title: 'f و v', face: '🔊', pairs: [
        { key: 'f-v', phonemes: ['f', 'v'],
          why: 'بابُ V في Starters ‏2025 فيه كلمةٌ واحدة (very) ولا صورةَ صادقة لها '
            + '— فلا زوجَ أدنى مصوَّرٌ في الرصيد (`METHOD.md §٤` أحكامُ المادة)' }] },
      { part: 's3-3', title: 'الحركاتُ القصار', face: '🐑', pairs: [
        { key: 'i-ee', phonemes: ['i', 'ee'], words: ['ship', 'sheep'] },
        { key: 'i-e', phonemes: ['i', 'e'],
          why: 'bit/bet وأخواتُهما ليست من مداخل Starters ‏2025' },
        { key: 'a-u', phonemes: ['a', 'u'],
          why: 'cap/cup ليستا من مداخل Starters ‏2025 (وفيها `baseball cap` وحدَها)' }] },
      // **والعنقودُ تجاورُ ساكنين لا صوتٌ ثالث**: التمييزُ فيه بين مطلعٍ عنقوديّ
      // ومطلعٍ مفرد (‏spider/sun) — فلا صوتَ معزولاً يُقابَل به، وحاملاه لازمان.
      { part: 's3-4', title: 'العناقيد', face: '🕷️', pairs: [
        { key: 'sp', words: ['spider', 'sun'] },
        { key: 'st', words: ['stop', 'sock'] },
        { key: 'fr', words: ['frog', 'fish'] }] },
    ],
  },
  {
    // **مادّةُ س٤ محسوبةٌ من الأصوات ومن حصيلة الطفل** (`earPool` أدناه): لا قائمةَ
    // مديات تُكتب بيد — فلا مدىً بلا مادّةٍ تكفيه، ولا صورةٌ يُسأل عنها الطفلُ ولم
    // يلقَها بعدُ في محطةٍ سابقة.
    id: 'listen4', ar: 'س٤ — الأذنُ الفونيمية', sub: 'أصواتٌ بلا حرفٍ يُرى',
    type: 'ear', face: '🔊',
    parts: [
      // **ثلاثٌ عتبةُ المادّة**: هدفٌ ومشتّتان في الجولة، فمدىً بأقلَّ من ثلاث كلماتٍ
      // يُعيد الصورةَ نفسَها في كل جولة فيُحفَظ الجوابُ بالشكل لا بالسمع.
      { part: 's4-1', title: 'الصوتُ الأول', face: '🔤', unit: 'phon', kind: 'pick',
        pool: 'met', initials: { min: 3 } },
      // **والدمجُ والتقطيعُ ثلاثةُ أصوات** (عينُ L&S المرحلة ١: CVC شفهياً) — ومادّتُهما
      // واحدة لأنّهما مهارتان متعاكستان على الكلمة نفسِها.
      { part: 's4-2', title: 'اجمعِ الأصوات', face: '🧩', unit: 'oral', kind: 'blend-ear',
        pool: 'met', sounds: { count: 3 } },
      { part: 's4-3', title: 'قطِّع الكلمة', face: '✂️', unit: 'oral', kind: 'segment-ear',
        pool: 'met', sounds: { count: 3 } },
      // **والقافيةُ كلمتان فأكثر**: تُسمَع واحدةٌ وتُلمَس أختُها، فاثنتان تكفيان مدىً.
      { part: 's4-4', title: 'القافية', face: '🎵', unit: 'rhyme', kind: 'pick',
        pool: 'met', rhymes: { min: 2 } },
    ],
  },
  {
    id: 'listen5', ar: 'س٥ — توسعةُ الرصيد', sub: 'بقيةُ الحقول، وجملُ «الآن وهنا»',
    type: 'quiz', face: '🧺',
    parts: [
      { part: 's5-1', title: 'الملابس', field: 'clothes', face: '👕' },
      { part: 's5-2', title: 'المدرسة واللعب', field: 'school', face: '📚' },
      { part: 's5-3', title: 'البيت أغراضاً', field: 'home', face: '🛏️' },
      { part: 's5-4', title: 'الأماكن والطبيعة', field: 'places', face: '🌳' },
      { part: 's5-5', title: 'أفعالُ اليوم', field: 'verbs', face: '🍽️' },
      { part: 's5-6', title: 'جملُ الآن وهنا', field: 'sentences', face: '🖼️',
        pictures: 'scene', sentences: [
          { id: 'cat-on-bed', text: 'The cat is on the bed', uses: ['cat', 'on', 'bed'] },
          { id: 'dog-under-chair', text: 'The dog is under the chair', uses: ['dog', 'under', 'chair'] },
          { id: 'bird-in-box', text: 'The bird is in the box', uses: ['bird', 'in', 'box'] },
          { id: 'fish-in-water', text: 'The fish is in the water', uses: ['fish', 'in', 'water'] },
          { id: 'ball-under-bed', text: 'The ball is under the bed', uses: ['ball', 'under', 'bed'] },
        ] },
    ],
  },
];

/** كلماتُ محطةٍ من الرصيد المصوَّر (`WORDS`) — بحقلها ومحطتها لا بقائمةٍ ثانية. */
const wordsAt = (part) => WORDS.filter((word) => word.at === part);

/**
 * **وحدةُ الكلمة**: الأفعالُ `verb` وما سواها `word` — والحقلُ `verbs` هو الفارق،
 * فلا يُخمَّن من صيغة الكلمة.
 */
const unitOfWord = (word) => (word.field === 'verbs' ? 'verb' : 'word');

/**
 * كلمةٌ من الرصيد المصوَّر باسمها، أو `undefined`.
 * **وبفهرسٍ يُبنى مرّة** لا بمسحٍ في كل نداء: تُنادى مئاتِ المرّات في تأليف الرحلة،
 * وبطءُ الخريطة على آيبادٍ قديم درسٌ مدفوعُ الثمن (`main.js` — الطيُّ الكسول).
 */
const WORD_INDEX = new Map(WORDS.map((word) => [word.w, word]));
const wordNamed = (name) => WORD_INDEX.get(name);

/**
 * **أمصوَّرٌ هذا الزوج؟ — حكمٌ بالبيانات لا بيد** (`METHOD.md §٤`: «بالصور **حيث**
 * للزوجين معنى مصوَّر»، وحكمُ المدير في f/v: «تمييزٌ صوتيٌّ خالص»).
 *
 * فالزوجُ مصوَّرٌ حيث **كلتا** كلمتيه في الرصيد المصوَّر **بصورةٍ مفردة تُلمَس**
 * (`face`)، وإلّا فتمييزٌ صوتيٌّ خالص. ولم يُكتب `mode` لزوجٍ بعينه: يومَ تدخل
 * كلمةٌ الرصيدَ (أو تخرج منه) ينتقل زوجُها من شكلٍ إلى شكل بلا سطرٍ يُعدَّل.
 */
export const pairMode = (pair) =>
  ((pair.words || []).length === 2 && pair.words.every((w) => wordNamed(w)?.face)
    ? 'word' : 'sound');

/** ترتيبُ محطات السمع مسطَّحاً — عليه يقوم «ما لقيَه الطفلُ قبل هذه المحطة». */
const listenParts = () => LISTEN_STAGES.flatMap((stage) => stage.parts);

/**
 * **حوضُ س٤: ما لقيَه الطفلُ قبل هذه المحطة، ممّا نعرف أصواتَه.**
 *
 * شرطان معاً، ولكلٍّ علّتُه:
 *   • **مصوَّرةٌ بوجهٍ ولها أصواتٌ معلَنة** — الجوابُ صورةٌ تُلمَس، وحكمُ «أوّلِ الصوت»
 *     والقافيةِ يحتاج أصواتَ الكلمة (`soundsOf`).
 *   • **لقيَها في محطةٍ سابقة** — سؤالُ «أيُّ الصور تبدأ بـ/s/؟» يفترض أنّ الطفلَ
 *     **يسمّي** ما يرى؛ فصورةُ كلمةٍ لم يلقَها بعدُ تجعل السؤالَ حزراً لا سمعاً.
 *     (وهو أشدُّ من قاعدة «المدخل المفهوم» عند س٢-٤: تلك كلمةٌ **تُسمَع** ولا تُقاس،
 *     وهذه صورةٌ **يُطلَب تسميتُها** ليُحكَم على صوتها.)
 */
const EAR_POOLS = new Map();

function earPool(partId) {
  // **ويُحسَب مرّةً**: الحوضُ يقرأ كلَّ محطةٍ قبله (ومنها محطاتُ س٤ نفسُها)، فحسابُه
  // في كل نداءٍ يضرب كلفةَ تأليف الرحلة — وبياناتُ المنهج لا تتحرّك وقتَ التشغيل.
  if (EAR_POOLS.has(partId)) return EAR_POOLS.get(partId);
  const parts = listenParts();
  const at = parts.findIndex((p) => p.part === partId);
  const met = new Map();
  for (const part of parts.slice(0, Math.max(at, 0))) {
    for (const word of listenWords(part)) {
      if (word.face && soundsOf(word.w)) met.set(word.w, word);
    }
  }
  const pool = [...met.values()];
  EAR_POOLS.set(partId, pool);
  return pool;
}

/** حوضُ محطةٍ مصنَّفاً بمفتاحٍ صوتيّ — أساسُ مديات س٤-١ وس٤-٤. */
function soundGroups(part, keyOf) {
  const groups = new Map();
  for (const word of earPool(part.part)) {
    const key = keyOf(word.w);
    if (key) groups.set(key, [...(groups.get(key) || []), word]);
  }
  return groups;
}

/** مدياتُ «الصوتِ الأول»: أصواتٌ لها من حوض المحطة ما يكفي (`initials.min`). */
const initialRanges = (part) =>
  [...soundGroups(part, (w) => soundsOf(w)?.[0])]
    .filter(([, words]) => words.length >= part.initials.min)
    .map(([sound]) => `initial-${sound}`).sort();

/** مدياتُ القافية: قوافٍ لها من حوض المحطة كلمتان فأكثر (`rhymes.min`). */
const rhymeRanges = (part) =>
  [...soundGroups(part, rimeOf)]
    .filter(([, words]) => words.length >= part.rhymes.min)
    .map(([rime]) => rime).sort();

/**
 * **موادُّ محطةٍ سمعية**: كلماتُها من الرصيد المصوَّر — إمّا كلماتُ محطتها كلُّها
 * (`WORDS[].at`)، وإمّا قائمةٌ معلَنة (`from`) تستعير ممّا سبق (س٢ تأمر بكلمات س١)،
 * وإمّا حوضٌ **محسوب** ممّا لقيَه الطفل (س٤ — `earPool`).
 */
function listenWords(part) {
  const byName = (list) => list.map(wordNamed).filter(Boolean);
  // زوجُ التمييز: حاملاه كلمتان مصوَّرتان — والزوجُ الصوتيّ الخالص بلا حاملَين
  // (`pairMode` أعلاه: الحكمُ بالبيانات).
  if (part.pairs) {
    return byName(part.pairs.filter((p) => pairMode(p) === 'word')
      .flatMap((p) => p.words || []));
  }
  if (part.sentences) return byName(part.sentences.flatMap((s) => s.uses));
  const named = [...(part.from || []), ...(part.colours || [])];
  if (named.length) return byName(named);
  if (part.pool === 'met') {
    const pool = earPool(part.part);
    return part.sounds
      ? pool.filter((w) => soundsOf(w.w).length === part.sounds.count)
      : pool;
  }
  return wordsAt(part.part);
}

/**
 * **أصواتُ محطةٍ المنطوقةُ معزولةً** — نصوصٌ من `PHONEMES` لا كلماتٌ من الرصيد، فلا
 * يجردها حارسُ الكلمات بل حارسُ الأصوات (`check_range` — بابُ أصوات المنهج).
 */
function listenSounds(part) {
  const says = (ids) => [...new Set(ids)].map(phonemeSay).filter(Boolean);
  if (part.pairs) {
    return says(part.pairs.filter((p) => pairMode(p) === 'sound')
      .flatMap((p) => p.phonemes || []));
  }
  if (part.initials) return says(initialRanges(part).map((r) => r.slice('initial-'.length)));
  // الدمجُ والتقطيعُ ينطقان أصواتَ كلماتهما واحداً واحداً
  if (part.sounds) return says(listenWords(part).flatMap((w) => soundsOf(w.w)));
  return [];
}

/**
 * **أدواتُ المشهد** — كلماتٌ **تُعرَض ولا تُقاس**: التفاحةُ والصندوق في «ضع التفاحةَ
 * في الصندوق»، والكرةُ في «المس الكرة الحمراء الكبيرة». المقيسُ في تلك المحطات
 * **حرفُ الجرّ والصفةُ** لا اسمُ الشيء، فلو دخلت الأدواتُ `words` لَصار لها مفتاحُ
 * ليتنر تُسأل عنه ولم تُدرَّس قطّ.
 *
 * **وهي مُعلَنةٌ لا مُهرَّبة**: تدخل جبهةَ محطتها بحقلها (أدناه) ويجردها
 * `check_range` كما يجرد كلماتِ التمرين — فما يراه الطفلُ محسوبٌ كلُّه، مقيساً كان
 * أو مادّةَ مشهد.
 */
const listenProps = (part) =>
  (part.props || []).map((w) => WORDS.find((x) => x.w === w)).filter(Boolean);

/** مفاتيحُ محطةٍ سمعية — تُشتقّ من موادّها، فلا مفتاحَ يُكتب مرّتين. */
function listenSkills(part) {
  if (part.sentences) return part.sentences.map((s) => `sentence|${s.id}|listen-pick`);
  if (part.pairs) return part.pairs.map((p) => `pair|${p.key}|pick`);
  if (part.initials) return initialRanges(part).map((r) => `${part.unit}|${r}|${part.kind}`);
  if (part.rhymes) return rhymeRanges(part).map((r) => `${part.unit}|${r}|${part.kind}`);
  const kind = part.kind || 'listen-pick';
  // و**الوحدةُ تُعلَن حين تفارق حقلَها**: س٤-٢ وس٤-٣ تسمعان كلماتِ س١ نفسَها ولكنّ
  // المقيسَ فيهما **الدمجُ والتقطيع** لا معرفةُ الكلمة (`oral|cat|blend-ear`، §٧).
  return listenWords(part).map((word) => `${part.unit || unitOfWord(word)}|${word.w}|${kind}`);
}

/**
 * جبهةُ محطةٍ سمعية: **حقولُها المفتوحة تُقرأ من موادّها لا تُكتب بيد** — فمحطةٌ
 * تستعير من حقلٍ لم تُعلنه تُمسَك، ولا يمرّ حقلٌ في الجبهة بلا كلمةٍ منه. ولا رمزَ
 * ولا شائكةَ في مسار السمع: مسارُ الحرف لم يُفتَح بعدُ (ق٤).
 */
const listenFrontier = (part) => ({
  fields: [...new Set([
    ...(part.field ? [part.field] : []),
    ...listenWords(part).map((word) => word.field),
    ...listenProps(part).map((word) => word.field),
    ...(part.sentences ? ['sentences'] : []),
  ])],
  symbols: [],
  tricky: [],
});

/** محطاتُ مسار السمع الأربعُ والعشرون — محسوبةٌ من `LISTEN_STAGES`. */
function listenStations() {
  return LISTEN_STAGES.flatMap((stage) => stage.parts.map((part) => ({
    id: `${stage.type}:${part.part}`,
    type: stage.type,
    part: part.part,
    track: 'listen',
    stage: stage.id,
    title: part.title,
    face: part.face,
    pictures: part.pictures || 'face',
    words: listenWords(part),
    props: listenProps(part),
    // نوعُ تمرينها ووحدةُ قياسها وقالبُ أمرها المنطوق وألوانُه — كما أعلنتها المحطة
    // (تقرؤها شاشتُها، فلا تعرف شاشةٌ محطةً بمعرّفها بل بما تُعلنه). **والوحدةُ تلزم
    // حيث يشترك النوع**: س٤-١ وس٤-٤ كلتاهما `pick`، وتفترقان بوحدتيهما (`phon` ·
    // `rhyme`) — فبها تعرف الشاشةُ أيَّ سؤالٍ تبني.
    kind: part.kind || 'listen-pick',
    unit: part.unit || '',
    order: part.order || '',
    colours: (part.colours || []).map(wordNamed).filter(Boolean),
    // **والزوجُ يخرج محكوماً لا خاماً**: شكلُه (`mode`) محسوبٌ، وحاملاه كلمتان من
    // الرصيد، ونصّا صوتيه منطوقان — فلا تعيد شاشتُه الحسابَ ولا تخالفه.
    pairs: (part.pairs || []).map((pair) => ({
      key: pair.key,
      mode: pairMode(pair),
      // **والمُعلَنُ يخرج مع المحسوب**: `names` أسماءُ الحاملَين كما أُعلنا، و`words`
      // ما وُجد منهما في الرصيد المصوَّر — فيقابل الحارسُ الشكلَ المحسوب بقاعدته،
      // ويمسك حاملاً أُعلن ولم يبلغ الرصيد (وإلّا سقط صامتاً وانقلب الشكل).
      names: [...(pair.words || [])],
      words: (pair.words || []).map(wordNamed).filter(Boolean),
      sounds: (pair.phonemes || []).map(phonemeSay),
      why: pair.why || '',
    })),
    // مدياتُ المحطة كما تُقاس (الحقلُ الثاني من مفتاحها) — تقرؤها شاشتُها
    ranges: listenSkills(part).map((key) => key.split('|')[1]),
    // ما تنطقه معزولاً من أصوات المنهج
    sounds: listenSounds(part),
    sentences: part.sentences || [],
    frontier: listenFrontier(part),
    skills: listenSkills(part),
  })));
}

/**
 * **نوعُ شاشة الدرجة**: `grade` لدرجةٍ تُدرِّس رموزاً، و`cluster` لدرجة العناقيد.
 * ويُقرأ من **إعلان الدرجة** (`clusters`) لا من خلوّ رموزها — فالخلوُّ قرينةٌ
 * تصدُق اليوم، والإعلانُ حكمٌ يبقى.
 */
const gradeType = (grade) => (grade.clusters ? 'cluster' : 'grade');

/**
 * **أللكلمة صورةٌ مفردةٌ تُلمَس؟** — شرطُ شكل `decode` نفسِه: «كلمةٌ مكتوبة تُفكّ
 * **فتُلمَس صورتُها**» (بندُ الجلسة ٤). وهو **حكمٌ بالبيانات لا بيد**، بقاعدة `specOf`
 * عينِها في `figures.js`: وجهٌ أو كمّيةٌ أو بقعةُ لونٍ أو وضعٌ مرسوم.
 *
 * **وثلاثُ كلماتٍ اليومَ خارجه بعلّةٍ واحدة**: `in` و`on` و`big` مادّتُها **مشهدٌ**
 * (`pictured: 'scene'`) — لا صورةَ مفردةَ لها تُلمَس، فمعناها إنّما يُرى في مشهد س٢
 * (تفاحةٌ **في** الصندوق · الكرةُ **الكبيرة**). فلا مفتاحَ فكٍّ لها، **ولها مفتاحُ
 * دمجٍ كسائرها** (الدمجُ يُسمَع فيُبنى، ولا يحتاج صورة) — فتُدرَّس ولا يسقط منها شيء.
 * (بندٌ يُرفَع: شكلُ فكٍّ في مشهدٍ بابٌ مفتوح لجلسةٍ تالية إن رآه المدير.)
 */
export const isTouchable = (word) => {
  const entry = WORD_INDEX.get(word);
  return Boolean(entry
    && (entry.face || entry.count || entry.swatch || entry.pictured === 'act'));
};

/** مفاتيحُ درجةٍ: رموزُها صوتاً↔رسماً · كلماتُها دمجاً وفكّاً · شائكاتُها. */
function gradeSkills(grade) {
  const keys = [];
  for (const symbol of grade.symbols) {
    // **ونطوقُ ح١٦ البديلة تُقاس بالرسم لا بالصوت**: السؤالُ فيها «هذا الرسمُ ما
    // صوتُه ههنا؟» — ولا معنى لسؤال «اسمع الصوتَ واختر رسمَه» ورسمُه هو الرسمُ نفسُه.
    if (!symbol.alt) keys.push(`gpc|${symbol.id}|sound-pick`);
    keys.push(`gpc|${symbol.id}|letter-pick`);
  }
  for (const word of grade.words) keys.push(`word|${word.w}|build`);
  for (const word of grade.words) {
    if (isTouchable(word.w)) keys.push(`word|${word.w}|decode`);
  }
  for (const word of grade.tricky) keys.push(`tricky|${word}|read`);
  for (const pair of grade.vowelPairs || []) keys.push(`vowel|${pair}|mid-pick`);
  return keys;
}

/** محطاتُ مسار الحرف الستَّ عشرة — كلُّ درجةٍ محطةٌ واحدة (`METHOD.md §٥`). */
function gradeStations() {
  return GRADES.map((grade) => ({
    id: `${gradeType(grade)}:${grade.id}`,
    type: gradeType(grade),
    part: grade.id,
    track: 'letter',
    stage: grade.era,
    title: `${grade.ar} — ${grade.symbols.map((s) => s.g).join(' ') || 'العناقيد'}`,
    face: '🔠',
    // **ومحطاتُ الحرف نصٌّ لا صور**: المعروضُ فيها الرسمُ نفسُه يُفكّ، فلا يُطالَب
    // كلماتُها بصورةٍ — وصورتُها إنّما تُطلب في محطتها السمعية (قيدُ الاقتران).
    pictures: 'text',
    words: grade.words,
    pool: wordsUpTo(grade.id),
    frontier: {
      fields: [],
      symbols: symbolsUpTo(grade.id),
      tricky: trickyUpTo(grade.id),
    },
    skills: gradeSkills(grade),
  }));
}

/**
 * **القصصُ شبهُ المفكوكة** (`METHOD.md §٥`): «من بعد 🚪٢، كتابٌ لكل درجةٍ فصاعداً» —
 * فالبوابةُ الثانية بعد ح٥، والقصصُ من ح٦ إلى ح١٦.
 *
 * و`text` نصُّ القصة — **تكتبه الجلستان ٦ و٧** (بندُهما في `SESSIONS.md`)، وحتى
 * ذلك اليوم `null`: و`check_range` **ينام على غيابه نوماً ذاتياً** ويستيقظ يومَ
 * يُكتب أولُ نصّ، فلا يملك أحدٌ أن ينسى فحصَه.
 */
const STORY_FROM = 'h06';

function storyStations() {
  const start = GRADES.findIndex((g) => g.id === STORY_FROM);
  return GRADES.slice(start).map((grade) => ({
    id: `story:${grade.id}`,
    type: 'story',
    part: grade.id,
    track: 'letter',
    stage: grade.era,
    title: `قصةُ ${grade.ar}`,
    face: '📖',
    pictures: 'text',
    words: [],
    text: null,
    frontier: {
      fields: [],
      symbols: symbolsUpTo(grade.id),
      tricky: trickyUpTo(grade.id),
    },
    skills: [`text|${grade.id}|read`],
  }));
}

/**
 * **محطاتُ الرحلة** (`METHOD.md §٤–§٥`) — محسوبةٌ من الجداول أعلاه، لا مكتوبةٌ يدَاً.
 * ويقرؤها `test_measure.mjs` ليقابل ما يعلنه المنهجُ بما تكتبه الشاشات، ويجردها
 * `check_range.py` جبهةً جبهة.
 */
export function stations() {
  return [...listenStations(), ...gradeStations(), ...storyStations()];
}

const stationsAt = (stageId) => stations().filter((s) => s.stage === stageId);

// ————————————————————————————————————————————————————————————————————————
// ٦) البوابات الثلاث
// ————————————————————————————————————————————————————————————————————————

/** مفاتيحُ مراحلَ بعينها — مدَى البوابة (`gateSkills`). */
const skillsOfStages = (...stageIds) =>
  stations().filter((s) => stageIds.includes(s.stage)).flatMap((s) => s.skills);

/**
 * **البوابات الثلاث** (`METHOD.md §٤–§٥`) — و`after` معرّفُ القسم الذي تليه.
 * وأولاها **بابُ منهجٍ لا تشجيع**: اجتيازُها شرطُ فتح مسار الحرف (ق٤).
 */
export const GATES = [
  {
    id: 'ear', after: 'listen4', title: 'عبورُ الأذن', face: '👂',
    hint: 'أذنُك صارت تعرف الإنكليزية — وبعدها نفتح بابَ الحروف',
    again: 'أُذنُك تكبر مع كل سماع — نسمع مرّةً أخرى ثم نعبر',
    opens: 'letter',
    scope: skillsOfStages('listen1', 'listen2', 'listen3', 'listen4'),
  },
  {
    id: 'decode', after: 'letter1', title: 'عبورُ الفكّ', face: '🔤',
    hint: 'صرتَ تفكّ الكلمة بنفسك — صرتَ قارئاً أولَ',
    again: 'الحروفُ تحتاج تكراراً — نفكّ بعضَها ثانيةً ثم نعبر',
    scope: skillsOfStages('letter1'),
  },
  {
    id: 'end', after: 'letter4', title: 'ختامُ التأسيس', face: '🎓',
    hint: 'أذنُك تفهم وعينُك تفكّ — تمّ التأسيس',
    again: 'بقيت خطوة: نشدّ ما تزعزع من السمع والحرف معاً ثم نختم',
    scope: skillsOfStages('listen1', 'listen2', 'listen3', 'listen4', 'listen5',
      'letter1', 'letter2', 'letter3', 'letter4'),
  },
];

// ————————————————————————————————————————————————————————————————————————
// ٧) أقسامُ الرحلة بالترتيب — الوصلةُ الوحيدة بين المنهج والواجهة
// ————————————————————————————————————————————————————————————————————————
//
// **وترتيبُها عقدُ الرحلة**: القفلُ تسلسليّ (`progress.js`)، فما وُضع أولاً فُتح أولاً.
//
// ————— **موضعُ س٥: تداخلٌ محسوب لا كتلةٌ تُقدَّم** (حكمُ المدير، `METHOD.md §٤`) —————
//
// وضعت الجلسةُ ١ كتلةَ س٥ الستَّ **بعد 🚪١ وقبل ح١** لتمنع وقوفَ مسار الحرف عند أوّل
// كلمةٍ من حقولها (قيدُ الاقتران)، فحكم المدير (١٣ أغسطس ٢٠٢٦): العلّةُ وجيهةٌ
// **ونصفُ الحلّ** — إذ يؤخّر ذلك أوّلَ حرفٍ ستَّ محطات فينقض توازيَ المرشَّح ب. ونصُّ
// الحكم: «الخريطةُ خطٌّ واحد (مبدأ العائلة الأول)، فالتوازي يُترجَم **تداخلاً
// بالبيانات**: كلُّ محطةِ س٥ تُوضَع قبل أولِ درجةِ حرفٍ تحتاج كلماتِ حقولها مباشرةً،
// **ولا تتقدم كتلةُ س٥ كلُّها على ح١**».
//
// **والموضعُ محسوبٌ من البيانات لا مكتوبٌ بيد**: لكلِّ كلمةِ قراءةٍ **مفتاحُها السمعيّ
// مكتوباً** (`GRADES[].words[].listen` — عقدُ الجلسة ١)، فأوّلُ درجةٍ تحمل كلمةً
// مفتاحُها من محطة س٥ هي التي تسبقها تلك المحطة. فإن تحرّكت كلمةٌ في السلّم غداً تحرّك
// موضعُ المحطة معها، ولا سطرَ يُعدَّل هنا. (وما لا تحتاجه درجةٌ — جملُ س٥-٦ — يلحق
// بآخر موضعِ تداخل، فلا يُترك إلى ذيل الرحلة بلا علّة.)
//
// **وهذا هو التوازي مترجَماً**: أوّلُ ثلاث درجاتٍ من الحرف تسبق أوّلَ محطةِ توسعة،
// ثم يتناوب المساران بحسب حاجة الكلمة نفسِها — والتوازي التامّ يقع حيث نصَّ عليه
// المنهج: في **المراجعة اليومية** التي تسحب من الجبهتين معاً (`METHOD.md §٧`).

const nodeOf = (station) => ({
  id: station.id,
  type: station.type,
  part: station.part,
  title: station.title,
  face: station.face,
});

const gateNode = (gate) => ({
  id: `gate:${gate.id}`,
  type: 'gate',
  part: gate.id,
  title: gate.title,
  face: gate.face,
});

const gateSection = (gateId) => {
  const gate = GATES.find((g) => g.id === gateId);
  return {
    kind: 'gate', id: `gate-${gate.id}`, title: gate.title, sub: gate.hint,
    face: gate.face, accent: 'var(--accent-gate)', nodes: [gateNode(gate)],
  };
};

const stageSection = (stage) => ({
  kind: 'stage', id: stage.id, title: stage.ar, sub: stage.sub, face: stage.face,
  accent: 'var(--accent-listen)',
  nodes: stationsAt(stage.id).map(nodeOf),
});

/**
 * قسمُ عهدٍ — أو **جزءٌ منه** حين تتخلّله محطةُ توسعةٍ سمعية أو حين يطول.
 *
 * **والجزءُ الأخير يحمل معرّفَ العهد** (`letter1`) وما قبله مرقَّم (`letter1-1`):
 * لأنّ البوابةَ تُعلن موضعَها بـ`after: 'letter1'` — وهي إنّما تلي **تمامَ** العهد
 * لا أوّلَ أجزائه. فلو حمل الأولُ الاسمَ لَوقعت 🚪٢ في وسط العهد الذي تختمه.
 */
const eraSection = (era, stations, index, count, sub) => ({
  kind: 'era',
  id: index === count - 1 ? era.id : `${era.id}-${index + 1}`,
  title: era.ar.split(' — ')[0],
  sub: index === 0 ? era.ar.split(' — ')[1] : sub,
  face: '🔠', accent: 'var(--accent-letter)',
  nodes: stations.map(nodeOf),
});

/**
 * **سقفُ عقد القسم الواحد** — قرارُ المالك (`FAMILY §١٠ب`): **سقفٌ لا هدف**، لا قسمَ
 * في الخريطة فوق اثنتي عشرةَ عقدة. وعلّتُه في يد الطفل: درجٌ يُفرَد فيملأ الشاشةَ
 * بما لا يُحاط به نظراً. ويحرسه `check_range.py` (بابُ حدّ المجموعة) مُجرَّباً سالباً.
 */
export const SECTION_CAP = 12;

/**
 * شطرُ قائمةٍ إلى أجزاءٍ **متساوية** لا إلى «سقفٍ وبقية»: أربعَ عشرةَ محطةً تصير
 * سبعاً وسبعاً لا اثنتي عشرةَ واثنتين — فلا يبقى في الخريطة ذيلٌ لا يُفهَم لِمَ هو.
 */
function evenChunks(list, cap) {
  const parts = Math.max(1, Math.ceil(list.length / cap));
  const size = Math.ceil(list.length / parts);
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** **المرحلةُ المتداخلة** — نصُّ `METHOD.md §٤`: س٥ وحدَها تُواصل موازيةً لمسار الحرف. */
const INTERLEAVED = 'listen5';

/** قسمُ توسعةٍ سمعية متداخل — محطةٌ أو أكثرُ يجمعها موضعُ تداخلٍ واحد. */
const listen5Section = (stations) => {
  const stage = LISTEN_STAGES.find((s) => s.id === INTERLEAVED);
  return {
    kind: 'stage', id: `${stage.id}-${stations[0].part}`, title: stage.ar,
    sub: stations.map((s) => s.title).join(' · '),
    face: stage.face, accent: 'var(--accent-listen)',
    nodes: stations.map(nodeOf),
  };
};

/**
 * **أوّلُ درجةِ حرفٍ تحتاج كلماتِ هذه المحطة مباشرةً** — أو `null` إن لم تحتجها درجة.
 *
 * تُقرأ من **المفتاح السمعيّ المكتوب** في كل كلمة قراءة (`words[].listen`)، وهو عينُ
 * ما يفرضه قيدُ الاقتران — فموضعُ المحطة على الخريطة والقيدُ الذي يحكمها **مصدرُهما
 * واحد**، ولا يفترقان يومَ تنتقل كلمةٌ من درجةٍ إلى درجة.
 */
function firstGradeNeeding(station) {
  const keys = new Set(station.skills);
  return GRADES.find((g) => g.words.some((w) => keys.has(w.listen)))?.id || null;
}

/**
 * مواضعُ التداخل: `درجةٌ ← محطاتُ س٥ التي تسبقها`.
 * **وما لا تحتاجه درجة** (جملُ س٥-٦ — لا تدخل كلمةُ قراءةٍ حقلَها) يلحق **بآخر موضع**
 * لا بذيل الرحلة: مادّتُه جملٌ من حقولٍ فُتحت كلُّها قبله، فتأخيرُه بلا علّةٍ تأخير.
 */
function listen5Slots() {
  const slots = new Map();
  const loose = [];
  for (const station of listenStations().filter((s) => s.stage === INTERLEAVED)) {
    const at = firstGradeNeeding(station);
    if (at) slots.set(at, [...(slots.get(at) || []), station]);
    else loose.push(station);
  }
  const order = GRADES.map((g) => g.id);
  const last = [...slots.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b)).pop();
  if (loose.length && last) slots.set(last, [...slots.get(last), ...loose]);
  return { slots, loose: last ? [] : loose };
}

/** أقسامُ مسار الحرف ومعها محطاتُ س٥ في مواضعها المحسوبة. */
function letterSections() {
  const { slots, loose } = listen5Slots();
  const used = new Set();
  const out = [];
  for (const era of ERAS) {
    const groups = [[]];
    const inserts = new Map();      // موضعُ المجموعة ← محطاتُ س٥ التي تسبقها
    for (const station of stationsAt(era.id)) {
      // **والقصةُ لا تفتح موضعاً**: هي ودرجتُها جزءٌ واحد (`part` نفسُه)، والتداخلُ
      // يقع قبل **الدرجة** التي تحتاج الكلمات لا قبل قصّتها.
      const before = station.type === 'story' || used.has(station.part)
        ? null : slots.get(station.part);
      if (before?.length) {
        used.add(station.part);
        if (groups.at(-1).length) groups.push([]);
        inserts.set(groups.length - 1, before);
      }
      groups.at(-1).push(station);
    }
    /* **ثم يُشطَر الطويلُ بالسقف** (`SECTION_CAP`): والشطرُ بعد التداخل لا قبله، فما
       شطره التداخلُ قد لا يبلغ السقفَ أصلاً — ولكلِّ جزءٍ **سببُ نشأته مكتوباً** في
       سطره، فلا يقرأ الوالدُ «تتمةً بعد محطة سمع» وليس قبلها محطةُ سمع. */
    const parts = groups.flatMap((stations, index) => [
      ...(inserts.has(index) ? [{ listen5: inserts.get(index) }] : []),
      ...evenChunks(stations, SECTION_CAP).map((chunk, at) => ({
        stations: chunk,
        sub: at === 0 ? 'تتمةُ العهد — بعد محطةِ السمع التي تفتح كلماتِها'
          : 'تتمةُ العهد — جزءٌ ثانٍ كي لا يطول القسمُ على عينِ الطفل',
      })),
    ]);
    const eras = parts.filter((part) => part.stations).length;
    let at = 0;
    for (const part of parts) {
      if (part.listen5) {
        out.push(listen5Section(part.listen5));
        continue;
      }
      out.push(eraSection(era, part.stations, at, eras, part.sub));
      at++;
    }
  }
  // **ولا محطةَ تسقط من الخريطة**: موضعٌ لم يُصادَف (درجةٌ حُذفت) أو ذيلٌ بلا مواضعَ
  // أصلاً يلحق بآخر الرحلة — ويمسكه `check_range` («محطةٌ في المنهج لا تصل») إن ضاع.
  const orphans = [...slots].filter(([at]) => !used.has(at)).flatMap(([, list]) => list);
  if (orphans.length || loose.length) out.push(listen5Section([...orphans, ...loose]));
  return out;
}

/**
 * **أقسامُ الرحلة بالترتيب** — تُؤلَّف تأليفاً من المراحل والعهود والبوابات،
 * فلا عقدةَ تُكتب بيد ولا عددَ يُحصى.
 *
 * **والبوابةُ تلي قسمَها بإعلانها** (`GATES[].after`) لا بسطرٍ يُكتب هنا: فلو انقسم
 * عهدٌ أجزاءً بتداخل س٥ بقيت البوابةُ في موضعها من تمامه.
 */
export function sections() {
  const out = [];
  const emit = (section) => {
    out.push(section);
    const gate = GATES.find((g) => g.after === section.id);
    if (gate) out.push(gateSection(gate.id));
  };
  for (const stage of LISTEN_STAGES) {
    if (stage.id !== INTERLEAVED) emit(stageSection(stage));
  }
  for (const section of letterSections()) emit(section);
  return out;
}

/** البوابةُ التي تقف قبل هذا الموضع، أو `null` — بيانٌ مُعلَن لا شرطٌ مضمر. */
export function gateBefore(where) {
  return GATES.find((gate) => gate.after === where) || null;
}

/** بوابةٌ بمعرّفها (تستعملها شاشةُ البوابة في `gate.js`). */
export function gateById(id) {
  return GATES.find((gate) => gate.id === id) || null;
}

/**
 * **مدى البوابة**: مفاتيحُ المهارات التي تسأل عنها هذه البوابة من أضعف ما في يد
 * الطفل (`METHOD.md §٤`: «من **أضعف** مهارات س١–س٤»). ولولا المدى لَتصدّر جلسةَ
 * بوابةِ الفكّ ضعفٌ في السمع، فمرّ الطفل إلى القراءة وفكُّه متزعزع — وهي عينُ
 * العلّة التي وُجدت البوابةُ لها.
 */
export function gateSkills(id) {
  return gateById(id)?.scope || [];
}

// ————— لوحة الوالد: **بالمهارة لا بالدرجة** (`METHOD.md §٧` و§٨ والجلسة ٨) —————
//
// اللوحةُ تُترجم ولا تخترع: أسماءُ الوحدات وعباراتُها **بياناتُ منهجٍ هنا** (مَن كتب
// مفتاحَ ليتنر يسمّيه)، والمدى يُقرأ من سجلّ ليتنر الحيّ — فلا رقمَ في اللوحة مكتوبٌ
// بيد ولا عبارةَ تُقال بلا سجلٍّ يسندها.

/** **أقسامُ اللوحة** — قسمان جوهريان: السمعُ والحرف (`SESSIONS.md §٨`). */
export const UNIT_SECTIONS = [
  { id: 'listen', title: 'ما يسمعه ويفهمه' },
  { id: 'letter', title: 'ما يفكّه ويقرؤه' },
];

/**
 * **جدولُ الوحدات** — الحقلُ الأول من مفتاح ليتنر (`METHOD.md §٧`).
 *
 * وزيادةٌ واحدة على أمثلة §٧: **`sentence`** لجمل س٥-٦ («The cat is on the bed»)،
 * ولم تُجعَل `text` لأنّ `text` وحدةُ **القصص** في مسار الحرف — ووحدةٌ واحدة لا
 * تسكن قسمين في لوحة الوالد، فتصير عبارتُها كاذبةً على أحدهما. (بندٌ يُرفَع.)
 */
export const UNIT_UNITS = [
  { id: 'word', section: 'listen', title: 'كلماتٌ يعرفها سمعاً',
    does: 'يعرف {ما} سمعاً', needs: 'يحتاج تثبيتَ {ما}' },
  { id: 'verb', section: 'listen', title: 'أفعالٌ يفهمها وينفّذها',
    does: 'ينفّذ {ما} حين يسمعها', needs: 'يحتاج تثبيتَ {ما}' },
  { id: 'pair', section: 'listen', title: 'أصواتٌ متقاربة يميّزها',
    does: 'يميّز {ما} سمعاً', needs: 'يخلط {ما}' },
  { id: 'phon', section: 'listen', title: 'أولُ الصوت في الكلمة',
    does: 'يعرف أوّلَ الصوت في {ما}', needs: 'يحتاج تمييزَ أوّل الصوت في {ما}' },
  { id: 'oral', section: 'listen', title: 'دمجُ الأصوات وتقطيعُها سمعاً',
    does: 'يدمج ويقطّع {ما} سمعاً', needs: 'يحتاج تدريباً على {ما}' },
  { id: 'rhyme', section: 'listen', title: 'القافية',
    does: 'يسمع قافيةَ {ما}', needs: 'يحتاج سماعَ قافية {ما}' },
  { id: 'sentence', section: 'listen', title: 'جملٌ يفهمها مصوَّرة',
    does: 'يفهم {ما} مسموعةً', needs: 'يحتاج تكرارَ {ما}' },
  { id: 'gpc', section: 'letter', title: 'رموزٌ يعرف أصواتها',
    does: 'يعرف صوتَ {ما} ورسمَه', needs: 'يحتاج تثبيتَ {ما}' },
  { id: 'vowel', section: 'letter', title: 'الصائتُ الأوسط',
    does: 'يسمع الصائتَ الأوسط في {ما}', needs: 'يخلط {ما}' },
  { id: 'tricky', section: 'letter', title: 'كلماتٌ شائكة',
    does: 'يقرأ {ما}', needs: 'يحتاج تكرارَ {ما}' },
  { id: 'text', section: 'letter', title: 'قصصٌ يقرؤها',
    does: 'يقرأ {ما}', needs: 'يحتاج إعادةَ {ما}' },
];

/**
 * **وصفُ وحدةِ قياسٍ** — الشكل: `{ section, title, does, needs }`.
 * والمجهولُ يُردّ `null` فلا يُعرَض للوالد مفتاحٌ خام (عقدُ `parent.js`).
 */
export function unitOf(unit) {
  return UNIT_UNITS.find((u) => u.id === unit) || null;
}

/** عباراتُ مدَياتٍ لا تُقرأ خاماً — مكتوبةٌ بأسبابها لا مشتقّةٌ بحيلة. */
const RANGE_WORDS = {
  'p-b': 'p و b', 'f-v': 'f و v', 'i-ee': 'ship و sheep',
  'i-e': 'الحركة القصيرة i و e', 'a-u': 'الحركة القصيرة a و u',
  sp: 'عنقود sp', st: 'عنقود st', fr: 'عنقود fr',
  'a-i': 'الصائت a و i', 'e-o': 'الصائت e و o', 'i-u': 'الصائت i و u',
};

/**
 * **المدى بعبارة الوالد**: يترجم الحقلَ الثاني من المفتاح (`cat` · `p-b` · `h05` …)
 * إلى ما يقرؤه بالغٌ عربيّ. **والمجهولُ يُردّ كما هو لا يُخفى**.
 *
 * **والوحدةُ تُمرَّر لأنّ المدى وحدَه يلتبس**: مدَى القافية أصواتٌ (`ee`) قد يوافق
 * **رسمَ** رمزٍ في السلّم (`gpc|ee|sound-pick`) — فيقرأ الوالدُ سطرين متطابقين
 * لمهارتين مختلفتين. (وكان جدولُ العبارات يحسم ذلك بيد فيغلب القافيةَ على الرمز.)
 */
export function rangeText(range, unit = '') {
  const text = String(range ?? '');
  if (!text) return '';
  if (unit === 'rhyme') return `قافية ‎-${text}`;
  if (RANGE_WORDS[text]) return RANGE_WORDS[text];
  if (text.startsWith('initial-')) {
    const sound = text.slice('initial-'.length);
    return `أوّلُ صوت ${phonemeSay(sound) || sound}`;
  }
  const grade = GRADES.find((g) => g.id === text);
  if (grade) return `الدرجة ${grade.ar.slice(1)}`;
  // **والرسمُ وحدَه لا يكفي حين يشترك فيه رمزان**: `oo` في boot غيرُها في look،
  // و`ow` في cow غيرُها في yellow — فلو عُرضتا للوالد باسمٍ واحد لقرأ سطرين
  // متطابقين لمهارتين مختلفتين، فظنّ أحدهما تكراراً. فالمثالُ يميّزهما.
  const symbol = symbolById(text);
  if (symbol) {
    const shared = GRADES.flatMap((g) => g.symbols).filter((s) => s.g === symbol.g);
    return shared.length > 1 ? `${symbol.g} (كما في ${symbol.ex})` : symbol.g;
  }
  const sentence = LISTEN_STAGES.flatMap((s) => s.parts)
    .flatMap((p) => p.sentences || []).find((s) => s.id === text);
  if (sentence) return `«${sentence.text}»`;
  return text;
}

/**
 * **ترتيبُ الوحدات كما لقيها الطفل** لا كما تُرتَّب حروفُها — تقرؤه اللوحة فتعرض
 * الوحداتِ بترتيب الرحلة داخلَ كل قسم.
 */
export function journeyUnits() {
  return [...new Set(stations().flatMap((s) => (s.skills || []).map((k) => k.split('|')[0])))];
}
