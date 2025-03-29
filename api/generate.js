
module.exports = async function handler(req, res) {
  const { topic, type, level } = req.body;

  const openaiUrl =
    "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";

  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY,
  };

  const sampleStyle = {
    "5": `Write like a realistic Level 5 HKDSE student. The tone should be natural and a little casual, like Chris Wong's article on shrinking families. Include relatable personal touches, rhetorical questions, or storytelling. Some awkward phrasing is fine. Make your grammar mostly accurate but not perfect. Vocabulary should be simple to intermediate. Structure should have clear points but some uneven development is acceptable. Target 600–750 words.
Sample Writing:
A century ago, women in Hong Kong had on average fie children. Today, that number is less than one.
Write an essay which gives reasons why having fewer children is more desirable now than in the past.

The shrinking family – an irreversible tide or an intended plan to be
Chris Wong

When being asked about on what occasion you would come across the most relatives, it is for sure we must say Chinese New Year. Has anyone of you counted how many there were? I did. A large batch of them which I could hardly name every one of them. Nevertheless, when you ask your brothers or sisters, some say one or two and even no. We can feel that the number of children people have nowadays is simply dwindling. Why is it the case?

To commence with, financial burden must by all means top the list. Olmpyian gold-medal winner, Lee lai-shan once said that it cost 2 million dollars to raise a child. As inflation persists, the number only goes up. Considering the fact that the wages and salaries have never been increased drastically, it is not surprising to see that many married couples choose not to have their own child. Imagine that the couple only earn a salary of $20,000 in total but half of it has already gone to renting, do they really have much money left for a child?

Apart from the abovementioned reasons, having babies is no longer a mission tasked by the seniors at home. In the old days, most of the couples are inculcated with the concept that once they got married, they should give birth to as many children as they could. This is especially pervasive in some of the oldest clans in the New Territories. It is like a tradition or a custom that giving birth to more kids means that they are not only larger in size but stronger and united. They could pass on their surnames if baby boys are born. However, as time changes, this is not as significant as before, having babies is on the couple’s own accordance. They may try to adopt one if they find having one detrimental to their health.

Last but by no means least, the roles of females having changed over the years can be attributed to the phenomenon which having fewer babies seems to be more desirable these days. As female workers become more dominating in the job field, being a housewife raising lots of kids at one time fail to satisfy their urge for triumph and praise. In traditional societies, men are always the breadwinners whilst women are supposed to be caretakers. In such cases, it was observable that the status quo of a female might be inferior to her husband. The husband has the say to have babies or not. He can also have as many as he wants as long as his economic status allows him to do so. But now things have changed, women has a higher autonomy to bargain. They may not possess the same thoughts as in the past. Since giving birth is not an easy decision and it may somehow affect the health of the pregnant woman, women these days tend not to have so many babies as before, not to mention they can stay focus on their career if they don’t have one.
There might still be a myriad of reasons behind but we have to agree on the part that some couples these days may have phobias of being parents so they choose not. It is definitely true as we can easily see couples pushing a pram with a baby dog inside, claiming this adorable fluffy creature as their baby boy or girl. They would rather have an animal than have a baby. So, instead of identifying the reasons why having fewer babies becomes more desirable, we must find ways to educate and encourage our children to be better parents. Parenting takes time and no matter you are taking care of one or two or even many at a time, it still requires love and affection.

It is of course great to witness that lots of parents learn to make decisions these days but I just hope that they are not trying avert from the responsibilities of being a parent so they stop having a lot of babies or having no babies. We all become parents for the first time and there’s no shame in it.
`,
    "5*": `Write like a confident Level 5* student. Use a formal tone and structured paragraphs like the school bus letter to the Bus Operators Association. Use extended arguments and support each with elaboration and examples. Your grammar should be largely accurate, and vocabulary moderately rich. Slight errors in expression are okay. Aim for fluency and coherence. Target 650–800 words.
Sample Writing:
Learning English through Social Issues
Many people say that private school bus service operators do not follow proper safety procedures when dealing with young children and they argue that this may pose a danger. Write a letter to the Bus Operators Association of Hong Kong to express your concerns and give recommendations for how private school bus services can be improved.

Dear sir / madam,

I am writing to express my deepest concerns on the malpractices of some of your fellow colleagues. As private school bus service operators, your colleagues should shoulder their responsibilities to follow the proper safety procedures when dealing with young children. I hope that the Bus Operators Association of Hong Kong could take the recommendations which I am going to give so that the danger of posed on our children, owing to these malpractices, can be eliminated.

The private school bus service operators do not follow the proper safety procedures as young children are allowed to go home on foot after getting off the school bus. The current practice poses great danger to the children’s safety as the children may walk across the road with high traffic. There lives are at risk if they walk across the road recklessly. This practice has seriously undermined the safety of the young children who may, at any time, suffer injuries from traffic accidents. Please also take note that the children’s safety is hindered as they are allowed to leave without the company of guardians or parents. Gangsters targeting young children now have more chances to commit offences against the children. The detrimental consequences of current practices can be far more serious than anticipated.

Moreover, for the sake of pursuing profit, some of your colleagues are having the school buses overloaded in order to earn more revenue. A school bus with 16 seats now serves more than 20 children. During the journey to the school, as if any accident happens, the injuries caused by overloading would be immeasurable. Your colleagues have acted in a greedy negligent manner in so doing. It is unbearable that school bus service operators have put the children’s safety at risk for private interest.

Besides, some of your colleagues have claimed that the difficult economic conditions have caused them become unable to have one caretaker on every school bus. It is certainly of the contrary to the proper safety procedures which require that there must be at least one caretaker on each school bus. Without the supervision of the caretaker, it is impossible for the vehicle drivers to note if there is any irregularity on the school bus. It is regrettable that your colleagues place economic consideration before the safety concerns of the children.

Measure must be taken in an effective and efficient way in order to predict the safety of the young children using the private school bus services. I propose the following recommendations to cope with the situations aforementioned. I wish that it will be possible for the Bus Operators Association of Hong Kong to implement the recommendations, with the aim to rectify the malpractices of your colleagues and remove the danger posed on the young children.

It is essential that parents’ consent must be obtained of children are to go home on foot themselves. The private school bus service operators are responsible for informing the parents’ of the great danger if they let their children go home alone. If parents or guardians fail to pick up their children at the scheduled time, their children will be taken back to school for safety reasons. Your colleagues should be reminded that if they fail to deliver this pledge of service, they will be banned and may be expelled from the membership of the Association indefinitely. It is hoped that the tough measure can have deterrent effect on the operators so that the children’s safety can be better protected.

The manpower problem has to be solved by recruiting more caretakers to avoid children being left unattended. For financial difficulties, it is proposed that your colleagues should ask for a rise in private school bus fare. Despite a rise in parents’ burden, it is worthwhile because we should, in all circumstances, prioritize the children’s safety as our primary concern. With ore caretakers, the children’s discipline and conducts can be monitored to minimize the possibility of an accident.

I am certain that the parents of children using the private school bus services will grateful to join me in expressing our gratitudes of the above recommendation are properly carried out. The Association’s effort in imposing the private school bus service is indispensable. “Though the medicine is harsh, but the parent requires it in order to live.” Lady Thatcher. I hope that the Association and your colleagues will take the words wisely and cause improvement in the private school bus services in due course.

Thank you very much.

Yours faithfully,
Chris Wong
`,
    "5**": `Write like a top Level 5** HKDSE candidate. Your language should be fluent, mature, and academically persuasive — like the real sports vs virtual sports essay. Use rhetorical techniques (e.g., parallelism, repetition), topic sentences, and transition words. Vocabulary should be advanced but appropriate. Structure must be coherent and logical with well-developed paragraphs. Target 700–850 words. Avoid native-speaker perfection — simulate local excellence.
    Sample Writing:
Learning English through Sports Communication
You have been following an online debate in Health and Fitness eMag about the value of doing virtual sports (such as those played on a Wii) versus real sports. Write your view on the topic and post it on the online forum.

Real Sports – the best choice ever

Notwithstanding the fact that the government always cast undue emphasis on the importance of physical development of oneself, the rapid development on technology seems to have gradually eroded this concept form people’s mind. The advent of virtual sports, whether is sport played via electronic devices such as Wii, seems to have brought us new hopes in rectifying the phenomenon of the lack of regular exercise of people. Nevertheless, there exist heated debate on whether virtual sports can transcend the value of real sports. After considering both the benefits and demerits of virtual sports as a whole in the long run, it is my thought that real sports should prevail.

The justifications to which my propensity can be ascribed are manifolds. Probably the first springing to my mind is that virtual sports cannot conform to the whole-person development concept. It is commonly acknowledged that interpersonal skill constitutes an indispensable role in today’s society, alongside  physical and intellectual one. However, virtual sports do not require much socialising with others. Imagine what will be like when a teenager play this so-called ‘sports’ on the television and you will see nothing but a geek staring at the screen without talking to everyone. In contrast, real sports require teamwork and socialising between players: you have to communicate with teammates well in a basketball game, and you can interact with others in a football game. With this in mind, it is a undeniable fact that real sports can train one’s intellectual skill but virtual sports cannot. Accordingly, real sports should prevail over virtual sports.

It might also be noted that virtual sports lack exposure to the natural environment. Nowadays, adolescents easily become geeks who only stay at home playing computer games all the time. In light of this, it is of profound significance for teens to go outdoors regularly in hopes of breathing fresher air and relaxing themselves with wholesome sunshine, rather than sitting inside a dark and small room. However, virtual sports are always confined to an inner small room where light is far away from adequate and the air might not be clean with the exhaust gas emitted by those electronic machines. A forceful illustration is that a boy in the UK was found fainted inside his home after playing Wii for long hours – all because the windows there are closed and no fresh air can come inside the flat. On the contrary, real sports can always expose oneself to the nature where cleaner air, comfortable breeze and adequate sunlight helps one to relax. With this in mind, it is an incontestable truth that real sports should transcend virtual one with enough exposure to the nature.



Advocates of virtual sports my counter my stance, claiming that there is not enough open space for one to engage in real sports in some high population density cities like Hong Kong, so virtual sports is better as it does not take much space. This assertion, though of certain validity at first glance, is fundamentally groundless. When it comes to the open areas in “highly-densed” cities, there is, in fact, always space available. Take Hong Kong as an example: the government has made effort to extend the sports areas for citizens over the past ten years. Yet, citizens in Hong Kong just do not take full advantage of these facilities. There are over three football courts and one sports stadium in Tun Chung, a newly-developed area in Hong Kong, let alone those districts with better-developed facilities. These areas, in fact, are readily available as they are always empty. With this in mind, the allegation that there are not enough open space in these cities will be only a misconception stemming from the hectic life style of citizens, and the so-called merit of virtual sports is ill-founded.

Taking all aspects into accounts, it is manifest to everyone that real sports have many advantages over virtual sports. We have to bear in mind that it is virtual sports that is at odd with the concept of whole-person development; that is in lack of exposure to the nature; and that may pose a threat on players’ health. In light of these, real sports should prevail over virtual sports and it is my hope that people can engage in real sports more for the sake of their health.
`};

  const writingPrompt = `You are an HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}".

${sampleStyle[level]}

End your writing with:
Word count: ___ words
`;

  try {
    const writingRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an HKDSE English teacher helping students write at a specific band level." },
          { role: "user", content: writingPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const writingData = await writingRes.json();
    let writing = writingData.choices?.[0]?.message?.content || "";

    writing = writing.replace(/Word count:\s*\d+\s*words?/i, "").trim();

    const cleanText = writing
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "")
      .replace(/\s{2,}/g, " ");
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    writing += `\n\nWord count: ${wordCount} words`;

    const feedbackPrompt = `You are a DSE English Paper 2 examiner.

The following writing was generated to simulate a Level ${level} student's performance. Justify why it matches the band in the fixed format below.

---
Content:
[2–3 sentences about relevance, clarity, ideas, support]

Language:
[2–3 sentences about grammar, phrasing, vocabulary]

Organisation:
[2–3 sentences about paragraphing, coherence, transitions]
---

Writing:
${writing}`;

    const feedbackRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an HKDSE examiner." },
          { role: "user", content: feedbackPrompt }
        ],
        temperature: 0.5,
        max_tokens: 500
      })
    });

    const feedbackData = await feedbackRes.json();
    const comment = feedbackData.choices?.[0]?.message?.content || "";

    res.status(200).json({ writing, comment });
  } catch (err) {
    console.error("FULL API ERROR:", JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to generate writing or feedback.",
      details: err.message || err,
    });
  }
};
