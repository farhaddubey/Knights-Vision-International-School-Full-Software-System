import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NobleKnights extends StatefulWidget {
  const NobleKnights({super.key});

  @override
  _NobleKnightsState createState() => _NobleKnightsState();
}

class _NobleKnightsState extends State<NobleKnights> with TickerProviderStateMixin {
  TabController? _chapterTabController;

  // Define supported languages
  final List<String> languages = ['English', 'Hindi', 'Tamil'];

  // Current selected language (default to English)
  String _selectedLanguage = 'English';

  // Sample translations (in a real app, use a localization package)
  final Map<String, List<Map<String, dynamic>>> translations = {
    "English": [
      {
        "title": "Humanism & Hard Work",
        "subsections": [
          {
            "title": "Respect Every Soul",
            "content": ["Every person holds equal dignity; treat them with fairness, without bias."],
            "explanation": "Treating everyone with fairness fosters unity and trust, essential for any thriving community."
          },
          {
            "title": "Work for Purpose",
            "content": ["Effort should be driven by inner honor, not outer applause."],
            "explanation": "Purpose-driven work ensures authenticity and resilience, preventing dependence on external validation."
          },
          {
            "title": "Dignity in All Labor",
            "content": ["No task is beneath you if it serves the greater good."],
            "explanation": "Valuing all work promotes humility and collective progress, recognizing every role’s contribution."
          },
          {
            "title": "No Shortcuts in Honor",
            "content": ["Any gain without integrity is a loss to the soul."],
            "explanation": "Upholding integrity preserves personal and societal trust, as shortcuts erode character."
          },
          {
            "title": "Effort Builds Tomorrow",
            "content": ["Consistent, disciplined work plants the seeds of greatness."],
            "explanation": "Consistent effort compounds over time, laying the foundation for future achievements."
          },
          {
            "title": "Cultivate Patience",
            "content": ["Steady progress outweighs hasty results."],
            "explanation": "Patience ensures sustainable growth, preventing rushed actions that compromise quality and success."
          },
          {
            "title": "Embrace Responsibility",
            "content": ["Own your actions to build trust."],
            "explanation": "Taking responsibility fosters reliability, strengthening community bonds through accountability."
          },
          {
            "title": "Serve with Humility",
            "content": ["Act with modesty in all endeavors."],
            "explanation": "Humility in service builds character, fostering cooperation and unity across all roles."
          },
          {
            "title": "Pursue Excellence",
            "content": ["Strive for quality in every task."],
            "explanation": "Commitment to excellence elevates personal standards and inspires others to achieve greatness."
          },
          {
            "title": "Foster Collaboration",
            "content": ["Work together for shared goals."],
            "explanation": "Collaboration harnesses collective strengths, driving progress and unity toward common objectives."
          },
          {
            "title": "Value Every Effort",
            "content": ["All contributions matter to success."],
            "explanation": "Recognizing every effort builds a culture of respect, enhancing team morale and productivity."
          },
          {
            "title": "Act with Courage",
            "content": ["Face challenges with bold resolve."],
            "explanation": "Courage in adversity strengthens character, enabling progress despite obstacles or fear."
          },
          {
            "title": "Seek Continuous Growth",
            "content": ["Always aim to improve yourself."],
            "explanation": "Lifelong growth ensures adaptability, fostering personal development and societal contribution."
          },
          {
            "title": "Build Trust Daily",
            "content": ["Consistency earns lasting confidence."],
            "explanation": "Daily trustworthy actions create reliable relationships, essential for community strength."
          },
          {
            "title": "Honor Commitments",
            "content": ["Keep promises, no matter the cost."],
            "explanation": "Fulfilling commitments builds integrity, ensuring others can rely on your word."
          },
          {
            "title": "Embrace Simplicity",
            "content": ["Focus on what truly matters."],
            "explanation": "Simplicity clarifies purpose, reducing distractions and aligning efforts with core values."
          },
          {
            "title": "Practice Gratitude",
            "content": ["Appreciate opportunities and others."],
            "explanation": "Gratitude fosters positivity, strengthening relationships and enhancing personal fulfillment."
          },
          {
            "title": "Lead by Example",
            "content": ["Inspire through your actions."],
            "explanation": "Exemplary behavior motivates others, creating a ripple effect of virtue and effort."
          },
          {
            "title": "Value Time",
            "content": ["Use every moment purposefully."],
            "explanation": "Respecting time maximizes productivity, ensuring efforts align with meaningful goals."
          },
          {
            "title": "Uplift Others",
            "content": ["Encourage growth in everyone."],
            "explanation": "Supporting others’ development builds a stronger community, fostering mutual success."
          }
        ]
      },
      {
        "title": "Respect Every Soul",
        "subsections": [
          {
            "title": "Embrace Diversity",
            "content": ["Recognize and value diverse backgrounds."],
            "explanation": "Embracing diversity strengthens community bonds, ensuring everyone feels valued."
          },
          {
            "title": "Practice Empathy",
            "content": ["Understand others’ perspectives."],
            "explanation": "Empathy bridges gaps, enabling deeper understanding and reducing conflicts."
          },
          {
            "title": "Uphold Fairness",
            "content": ["Ensure impartial actions, decisions."],
            "explanation": "Fairness builds trust, creating an environment where all thrive equally."
          },
          {
            "title": "Promote Equality",
            "content": ["Support equal opportunities for all."],
            "explanation": "Equality ensures talent and effort determine success, enhancing justice."
          },
          {
            "title": "Reject Prejudice",
            "content": ["Challenge biases for equity."],
            "explanation": "Rejecting prejudice prevents division, cultivating fairness and dignity."
          },
          {
            "title": "Listen Actively",
            "content": ["Hear others with full attention."],
            "explanation": "Active listening fosters understanding, showing respect for others’ views."
          },
          {
            "title": "Show Compassion",
            "content": ["Care deeply for others’ struggles."],
            "explanation": "Compassion builds connections, supporting those in need with kindness."
          },
          {
            "title": "Honor Differences",
            "content": ["Celebrate unique perspectives."],
            "explanation": "Valuing differences enriches communities, fostering creativity and unity."
          },
          {
            "title": "Build Inclusion",
            "content": ["Create spaces for all voices."],
            "explanation": "Inclusion ensures everyone feels heard, strengthening community bonds."
          },
          {
            "title": "Act with Kindness",
            "content": ["Treat others with genuine care."],
            "explanation": "Kindness creates positivity, building trust and mutual respect."
          },
          {
            "title": "Respect Boundaries",
            "content": ["Honor others’ personal limits."],
            "explanation": "Respecting boundaries fosters trust, ensuring safe and respectful interactions."
          },
          {
            "title": "Encourage Dialogue",
            "content": ["Promote open, honest communication."],
            "explanation": "Open dialogue builds understanding, resolving conflicts through mutual respect."
          },
          {
            "title": "Value Individuality",
            "content": ["Appreciate each person’s uniqueness."],
            "explanation": "Valuing individuality encourages authenticity, enhancing community diversity."
          },
          {
            "title": "Support Justice",
            "content": ["Advocate for fair treatment."],
            "explanation": "Supporting justice ensures equity, creating a balanced and harmonious society."
          },
          {
            "title": "Foster Trust",
            "content": ["Build confidence through actions."],
            "explanation": "Consistent, fair actions create trust, essential for strong relationships."
          },
          {
            "title": "Show Gratitude",
            "content": ["Appreciate others’ contributions."],
            "explanation": "Gratitude for others’ efforts strengthens bonds, fostering mutual respect."
          },
          {
            "title": "Avoid Judgment",
            "content": ["Refrain from hasty assumptions."],
            "explanation": "Avoiding judgment promotes fairness, ensuring decisions are based on truth."
          },
          {
            "title": "Promote Unity",
            "content": ["Unite people across differences."],
            "explanation": "Unity bridges divides, creating a cohesive community built on respect."
          },
          {
            "title": "Be Respectful",
            "content": ["Treat all with dignity always."],
            "explanation": "Consistent respect builds a culture of dignity, enhancing community strength."
          },
          {
            "title": "Learn from Others",
            "content": ["Gain wisdom from diverse views."],
            "explanation": "Learning from others’ perspectives enriches understanding, fostering growth."
          }
        ]
      },
      {
        "title": "Work for Purpose",
        "subsections": [
          {
            "title": "Intrinsic Motivation",
            "content": ["Guide work by personal values."],
            "explanation": "Intrinsic motivation aligns actions with beliefs, ensuring authentic effort."
          },
          {
            "title": "Cultivate Resilience",
            "content": ["Persevere without seeking praise."],
            "explanation": "Resilience ensures commitment to goals, undeterred by lack of recognition."
          },
          {
            "title": "Focus on Impact",
            "content": ["Prioritize work’s positive difference."],
            "explanation": "Focusing on impact amplifies efforts’ value beyond personal gain."
          },
          {
            "title": "Avoid Vanity",
            "content": ["Reject work for external fame."],
            "explanation": "Avoiding vanity keeps intentions pure, preserving integrity in actions."
          },
          {
            "title": "Build Inner Honor",
            "content": ["Let self-respect reward efforts."],
            "explanation": "Inner honor fosters self-worth, supporting growth independent of approval."
          },
          {
            "title": "Seek Meaning",
            "content": ["Find purpose in every task."],
            "explanation": "Purposeful tasks, however small, contribute to personal and collective growth."
          },
          {
            "title": "Stay Authentic",
            "content": ["Align work with true self."],
            "explanation": "Authenticity ensures efforts reflect personal values, fostering genuine impact."
          },
          {
            "title": "Embrace Challenges",
            "content": ["Tackle obstacles with determination."],
            "explanation": "Facing challenges builds resilience, turning difficulties into growth opportunities."
          },
          {
            "title": "Prioritize Duty",
            "content": ["Act for responsibility, not gain."],
            "explanation": "Duty-driven work ensures commitment to the greater good over personal reward."
          },
          {
            "title": "Value Process",
            "content": ["Focus on journey, not results."],
            "explanation": "Valuing the process fosters patience, ensuring sustainable and meaningful outcomes."
          },
          {
            "title": "Inspire Others",
            "content": ["Motivate through purposeful work."],
            "explanation": "Purposeful actions inspire peers, creating a culture of meaningful effort."
          },
          {
            "title": "Stay Disciplined",
            "content": ["Maintain focus on core goals."],
            "explanation": "Discipline keeps efforts aligned, ensuring consistent progress toward purpose."
          },
          {
            "title": "Act with Intent",
            "content": ["Every action should have purpose."],
            "explanation": "Intentional actions maximize impact, aligning efforts with meaningful goals."
          },
          {
            "title": "Avoid Distractions",
            "content": ["Focus on what drives purpose."],
            "explanation": "Eliminating distractions ensures efforts remain aligned with core values."
          },
          {
            "title": "Build Consistency",
            "content": ["Steady effort yields results."],
            "explanation": "Consistent work compounds over time, creating lasting impact and growth."
          },
          {
            "title": "Value Growth",
            "content": ["Seek progress through effort."],
            "explanation": "Effort-driven growth fosters resilience and continuous personal development."
          },
          {
            "title": "Serve Selflessly",
            "content": ["Work for others’ benefit."],
            "explanation": "Selfless service enhances community strength, prioritizing collective good."
          },
          {
            "title": "Stay Humble",
            "content": ["Let results speak for themselves."],
            "explanation": "Humility in work prevents ego, ensuring focus on purpose over praise."
          },
          {
            "title": "Pursue Mastery",
            "content": ["Aim for skill and excellence."],
            "explanation": "Mastery through effort elevates personal standards, inspiring others."
          },
          {
            "title": "Reflect on Purpose",
            "content": ["Assess why your work matters."],
            "explanation": "Reflection ensures efforts align with values, maximizing meaningful impact."
          }
        ]
      },
      {
        "title": "Dignity in All Labor",
        "subsections": [
          {
            "title": "Value Every Role",
            "content": ["Every task aids collective goals."],
            "explanation": "Valuing every role fosters teamwork, ensuring all contributions are vital."
          },
          {
            "title": "Practice Humility",
            "content": ["Serve regardless of task status."],
            "explanation": "Humility in labor builds unity, breaking barriers between roles."
          },
          {
            "title": "Support Others’ Work",
            "content": ["Uplift all forms of effort."],
            "explanation": "Supporting others’ efforts boosts morale, amplifying collective productivity."
          },
          {
            "title": "Find Purpose in Service",
            "content": ["Every task serves the greater good."],
            "explanation": "Service transforms tasks into meaningful acts, enhancing fulfillment."
          },
          {
            "title": "Reject Hierarchy",
            "content": ["No work is inferior if noble."],
            "explanation": "Rejecting hierarchy promotes equality, respecting all tasks’ contributions."
          },
          {
            "title": "Embrace All Tasks",
            "content": ["Tackle any job with pride."],
            "explanation": "Pride in all tasks fosters respect, enhancing personal and team growth."
          },
          {
            "title": "Recognize Effort",
            "content": ["Acknowledge all contributions."],
            "explanation": "Recognizing efforts builds a culture of respect, boosting morale."
          },
          {
            "title": "Work with Care",
            "content": ["Perform tasks with diligence."],
            "explanation": "Diligent work reflects respect for the task and its purpose."
          },
          {
            "title": "Foster Teamwork",
            "content": ["Collaborate across all roles."],
            "explanation": "Teamwork unites diverse efforts, driving collective success and harmony."
          },
          {
            "title": "Value Small Acts",
            "content": ["Small tasks build big outcomes."],
            "explanation": "Small acts accumulate, contributing significantly to collective goals."
          },
          {
            "title": "Act with Respect",
            "content": ["Treat all labor with dignity."],
            "explanation": "Respecting all labor fosters equality, enhancing community cohesion."
          },
          {
            "title": "Support Growth",
            "content": ["Encourage skill in all tasks."],
            "explanation": "Supporting skill development in any role promotes personal and team growth."
          },
          {
            "title": "Stay Committed",
            "content": ["Dedicate to every task fully."],
            "explanation": "Commitment to all tasks ensures quality and collective progress."
          },
          {
            "title": "Find Joy in Work",
            "content": ["Seek fulfillment in every task."],
            "explanation": "Finding joy in work enhances motivation, making tasks meaningful."
          },
          {
            "title": "Build Community",
            "content": ["Unite through shared effort."],
            "explanation": "Shared effort strengthens community, fostering collaboration and respect."
          },
          {
            "title": "Honor All Work",
            "content": ["Every task deserves respect."],
            "explanation": "Honoring all work promotes equality, ensuring no effort is overlooked."
          },
          {
            "title": "Serve with Pride",
            "content": ["Take pride in all service."],
            "explanation": "Pride in service elevates tasks, fostering personal and collective dignity."
          },
          {
            "title": "Encourage Effort",
            "content": ["Motivate others in their work."],
            "explanation": "Encouraging others’ efforts boosts morale, creating a supportive environment."
          },
          {
            "title": "Value Contribution",
            "content": ["Every role aids the whole."],
            "explanation": "Valuing contributions ensures all roles are seen as essential to success."
          },
          {
            "title": "Act with Purpose",
            "content": ["Every task has meaningful impact."],
            "explanation": "Purposeful tasks, big or small, contribute to personal and societal good."
          }
        ]
      },
      {
        "title": "No Shortcuts in Honor",
        "subsections": [
          {
            "title": "Uphold Integrity",
            "content": ["Choose honesty, even when harder."],
            "explanation": "Integrity ensures trust, aligning actions with ethical principles."
          },
          {
            "title": "Resist Temptation",
            "content": ["Avoid gains compromising values."],
            "explanation": "Resisting temptation preserves your moral compass, ensuring respect."
          },
          {
            "title": "Be Accountable",
            "content": ["Own actions, even in failure."],
            "explanation": "Accountability fosters trust, promoting growth through owned mistakes."
          },
          {
            "title": "Prioritize Trust",
            "content": ["Act to maintain others’ confidence."],
            "explanation": "Trustworthy actions build reliable relationships for collaboration."
          },
          {
            "title": "Value Long-Term",
            "content": ["Seek enduring ethical success."],
            "explanation": "Ethical success ensures sustainability, avoiding pitfalls of shortcuts."
          },
          {
            "title": "Act with Honesty",
            "content": ["Speak and act with truth."],
            "explanation": "Honesty builds credibility, fostering trust in all interactions."
          },
          {
            "title": "Stay Principled",
            "content": ["Hold firm to your values."],
            "explanation": "Principled actions ensure consistency, guiding you through challenges."
          },
          {
            "title": "Avoid Deception",
            "content": ["Reject misleading actions always."],
            "explanation": "Avoiding deception preserves trust, ensuring genuine relationships."
          },
          {
            "title": "Earn Respect",
            "content": ["Gain trust through honest work."],
            "explanation": "Honest work earns lasting respect, building strong community ties."
          },
          {
            "title": "Act Transparently",
            "content": ["Be open in all dealings."],
            "explanation": "Transparency fosters trust, ensuring actions are clear and honest."
          },
          {
            "title": "Value Fairness",
            "content": ["Treat all equitably always."],
            "explanation": "Fairness builds trust, creating an environment of equal opportunity."
          },
          {
            "title": "Uphold Duty",
            "content": ["Fulfill obligations with honor."],
            "explanation": "Honoring duties strengthens reliability, fostering trust and respect."
          },
          {
            "title": "Avoid Greed",
            "content": ["Reject gains at others’ expense."],
            "explanation": "Avoiding greed ensures ethical actions, prioritizing collective good."
          },
          {
            "title": "Be Consistent",
            "content": ["Act with steady integrity."],
            "explanation": "Consistent integrity builds trust, ensuring reliable character."
          },
          {
            "title": "Seek Truth",
            "content": ["Pursue honesty in all things."],
            "explanation": "Seeking truth aligns actions with reality, fostering credibility."
          },
          {
            "title": "Respect Promises",
            "content": ["Keep your word always."],
            "explanation": "Keeping promises builds trust, ensuring others rely on you."
          },
          {
            "title": "Act Ethically",
            "content": ["Choose right over easy."],
            "explanation": "Ethical choices uphold honor, ensuring long-term respect and trust."
          },
          {
            "title": "Build Credibility",
            "content": ["Earn trust through actions."],
            "explanation": "Credible actions strengthen relationships, fostering mutual respect."
          },
          {
            "title": "Value Honor",
            "content": ["Prioritize integrity above all."],
            "explanation": "Valuing honor ensures actions align with ethical principles always."
          },
          {
            "title": "Learn from Mistakes",
            "content": ["Grow through honest reflection."],
            "explanation": "Reflecting on mistakes fosters growth, strengthening character and trust."
          }
        ]
      },
      {
        "title": "Effort Builds Tomorrow",
        "subsections": [
          {
            "title": "Commit to Consistency",
            "content": ["Maintain steady effort always."],
            "explanation": "Consistency compounds actions into significant outcomes for success."
          },
          {
            "title": "Embrace Discipline",
            "content": ["Follow through on commitments."],
            "explanation": "Discipline turns intentions into results, building toward greatness."
          },
          {
            "title": "Plan for Future",
            "content": ["Align actions with long-term goals."],
            "explanation": "Planning ensures today’s efforts contribute to future achievements."
          },
          {
            "title": "Persevere in Challenges",
            "content": ["Push forward despite obstacles."],
            "explanation": "Perseverance turns challenges into opportunities, advancing progress."
          },
          {
            "title": "Plant Seeds of Greatness",
            "content": ["Effort invests in tomorrow’s success."],
            "explanation": "Disciplined actions create a legacy of achievement and impact."
          },
          {
            "title": "Stay Focused",
            "content": ["Keep goals in clear sight."],
            "explanation": "Focus ensures efforts remain aligned with long-term objectives."
          },
          {
            "title": "Build Resilience",
            "content": ["Endure setbacks with strength."],
            "explanation": "Resilience fosters growth, enabling progress despite difficulties."
          },
          {
            "title": "Value Small Steps",
            "content": ["Small efforts yield big results."],
            "explanation": "Small, consistent steps accumulate, driving significant future outcomes."
          },
          {
            "title": "Act with Purpose",
            "content": ["Every effort should have meaning."],
            "explanation": "Purposeful efforts align with goals, maximizing impact and growth."
          },
          {
            "title": "Embrace Hard Work",
            "content": ["Tackle tasks with full effort."],
            "explanation": "Hard work builds character, laying the foundation for success."
          },
          {
            "title": "Stay Committed",
            "content": ["Dedicate to long-term goals."],
            "explanation": "Commitment ensures steady progress, turning vision into reality."
          },
          {
            "title": "Learn from Setbacks",
            "content": ["Grow through challenges faced."],
            "explanation": "Setbacks provide lessons, strengthening resolve and fostering growth."
          },
          {
            "title": "Prioritize Progress",
            "content": ["Focus on steady improvement."],
            "explanation": "Prioritizing progress ensures continuous growth toward meaningful goals."
          },
          {
            "title": "Build Momentum",
            "content": ["Consistent effort drives success."],
            "explanation": "Momentum from steady work accelerates progress toward greatness."
          },
          {
            "title": "Value Patience",
            "content": ["Endure for lasting results."],
            "explanation": "Patience ensures sustainable outcomes, avoiding rushed, flawed efforts."
          },
          {
            "title": "Act with Vision",
            "content": ["Work toward a clear future."],
            "explanation": "Vision-guided efforts align actions with long-term aspirations."
          },
          {
            "title": "Stay Determined",
            "content": ["Push forward with resolve."],
            "explanation": "Determination overcomes obstacles, ensuring progress toward goals."
          },
          {
            "title": "Embrace Growth",
            "content": ["Seek improvement through effort."],
            "explanation": "Effort-driven growth fosters resilience and continuous development."
          },
          {
            "title": "Build Legacy",
            "content": ["Efforts shape future impact."],
            "explanation": "Today’s efforts create a lasting legacy of achievement and virtue."
          },
          {
            "title": "Value Time",
            "content": ["Use every moment wisely."],
            "explanation": "Respecting time maximizes effort, aligning actions with goals."
          }
        ]
      },
      {
        "title": "Discipline & Self-Mastery",
        "subsections": [
          {
            "title": "Guard Your Words",
            "content": ["Speak to uplift, never degrade."],
            "explanation": "Careful speech fosters positivity, building trust and respect in interactions."
          },
          {
            "title": "Master Your Time",
            "content": ["Punctuality shows self-respect."],
            "explanation": "Timeliness reflects discipline, honoring both self and others’ time."
          },
          {
            "title": "Focus is Wealth",
            "content": ["Guard mind from distractions."],
            "explanation": "Protecting focus maximizes productivity, treating attention as a treasure."
          },
          {
            "title": "Uniform & Conduct",
            "content": ["Appearance reflects discipline."],
            "explanation": "Orderly appearance signals inner discipline, fostering respect and credibility."
          },
          {
            "title": "Respect the Rules",
            "content": ["Rules shield the community."],
            "explanation": "Adhering to rules strengthens systems, ensuring collective stability."
          },
          {
            "title": "Control Emotions",
            "content": ["Manage feelings with wisdom."],
            "explanation": "Emotional control fosters clear thinking, enhancing decisions and relationships."
          },
          {
            "title": "Prioritize Goals",
            "content": ["Focus on what matters most."],
            "explanation": "Prioritizing goals ensures efforts align with meaningful outcomes."
          },
          {
            "title": "Stay Organized",
            "content": ["Keep life and tasks orderly."],
            "explanation": "Organization enhances efficiency, reducing chaos and boosting productivity."
          },
          {
            "title": "Practice Restraint",
            "content": ["Avoid impulsive actions always."],
            "explanation": "Restraint prevents regret, ensuring actions align with values."
          },
          {
            "title": "Build Willpower",
            "content": ["Strengthen resolve through practice."],
            "explanation": "Willpower grows through disciplined habits, enabling consistent progress."
          },
          {
            "title": "Value Clarity",
            "content": ["Seek clear thoughts, actions."],
            "explanation": "Clarity in thought and action ensures effective, purposeful outcomes."
          },
          {
            "title": "Embrace Routine",
            "content": ["Consistent habits drive success."],
            "explanation": "Routines build discipline, creating a foundation for lasting achievement."
          },
          {
            "title": "Act with Precision",
            "content": ["Perform tasks with care."],
            "explanation": "Precision in actions reflects discipline, ensuring high-quality results."
          },
          {
            "title": "Stay Accountable",
            "content": ["Own your choices, always."],
            "explanation": "Accountability fosters trust, ensuring responsibility for all actions."
          },
          {
            "title": "Cultivate Focus",
            "content": ["Concentrate on single tasks."],
            "explanation": "Focused effort maximizes efficiency, producing meaningful and effective results."
          },
          {
            "title": "Value Simplicity",
            "content": ["Simplify life for clarity."],
            "explanation": "Simplicity reduces distractions, aligning efforts with core priorities."
          },
          {
            "title": "Build Resilience",
            "content": ["Endure challenges with strength."],
            "explanation": "Resilience enables perseverance, turning obstacles into growth opportunities."
          },
          {
            "title": "Seek Balance",
            "content": ["Harmonize work and rest."],
            "explanation": "Balance prevents burnout, ensuring sustainable effort and well-being."
          },
          {
            "title": "Practice Reflection",
            "content": ["Assess actions for growth."],
            "explanation": "Reflection fosters self-awareness, guiding improvements in discipline."
          },
          {
            "title": "Stay Committed",
            "content": ["Dedicate to personal growth."],
            "explanation": "Commitment to growth ensures continuous progress toward self-mastery."
          }
        ]
      },
      {
        "title": "Wisdom from Religions",
        "subsections": [
          {
            "title": "Hinduism Values",
            "content": ["Dharma, Karma, Ahimsa guide actions."],
            "explanation": "Acting without attachment to reward fosters duty and non-violence."
          },
          {
            "title": "Buddhism Principles",
            "content": ["Mindfulness, compassion for all."],
            "explanation": "Mindfulness and compassion reduce suffering, promoting peace and understanding."
          },
          {
            "title": "Christianity Teachings",
            "content": ["Love, humility, forgive enemies."],
            "explanation": "Loving and forgiving others fosters humility and strong community bonds."
          },
          {
            "title": "Islam Disciplines",
            "content": ["Honesty, generosity, daily discipline."],
            "explanation": "Honesty and generosity build trust, strengthening community through discipline."
          },
          {
            "title": "Judaism Commitments",
            "content": ["Study, justice, truth always."],
            "explanation": "Devotion to truth and justice fosters wisdom and ethical living."
          },
          {
            "title": "Sikhism Equality",
            "content": ["Equal service, fearless courage."],
            "explanation": "Equality and courage in service promote justice and community strength."
          },
          {
            "title": "Bahá’í Unity",
            "content": ["Unity, peace, truth-seeking."],
            "explanation": "Seeking truth and unity fosters peace and collective progress."
          },
          {
            "title": "Taoism Balance",
            "content": ["Live in harmony with nature."],
            "explanation": "Harmony with nature fosters balance, promoting peace and simplicity."
          },
          {
            "title": "Confucianism Duty",
            "content": ["Respect, duty, ethical conduct."],
            "explanation": "Duty and respect guide ethical actions, strengthening societal harmony."
          },
          {
            "title": "Jainism Non-Violence",
            "content": ["Practice non-violence in all."],
            "explanation": "Non-violence fosters peace, ensuring respect for all living beings."
          },
          {
            "title": "Zoroastrianism Good",
            "content": ["Good thoughts, words, deeds."],
            "explanation": "Positive thoughts and deeds promote goodness, uplifting self and others."
          },
          {
            "title": "Shinto Purity",
            "content": ["Seek purity, respect nature."],
            "explanation": "Purity and respect for nature foster harmony and spiritual growth."
          },
          {
            "title": "Indigenous Wisdom",
            "content": ["Honor community and earth."],
            "explanation": "Respecting community and earth ensures balance and collective well-being."
          },
          {
            "title": "Humanist Ethics",
            "content": ["Reason, compassion guide actions."],
            "explanation": "Reason and compassion promote ethical decisions, enhancing human dignity."
          },
          {
            "title": "Stoicism Virtue",
            "content": ["Live with wisdom, courage."],
            "explanation": "Wisdom and courage guide virtuous living, fostering resilience and clarity."
          },
          {
            "title": "Universal Compassion",
            "content": ["Care for all beings equally."],
            "explanation": "Universal compassion unites humanity, reducing suffering and fostering peace."
          },
          {
            "title": "Seek Inner Peace",
            "content": ["Cultivate calm through reflection."],
            "explanation": "Inner peace fosters clarity, enabling wise and compassionate actions."
          },
          {
            "title": "Value Community",
            "content": ["Build bonds through shared values."],
            "explanation": "Shared values strengthen community, fostering unity and mutual support."
          },
          {
            "title": "Practice Gratitude",
            "content": ["Appreciate life’s shared blessings."],
            "explanation": "Gratitude enhances connection, fostering positivity across all beliefs."
          },
          {
            "title": "Live with Purpose",
            "content": ["Act with universal good in mind."],
            "explanation": "Purpose aligned with universal good promotes harmony and growth."
          }
        ]
      },
      {
        "title": "Innovation & Tech Ethics",
        "subsections": [
          {
            "title": "Build, Don’t Destroy",
            "content": ["Use tech to create value."],
            "explanation": "Technology should uplift, fostering progress without causing harm."
          },
          {
            "title": "Moral Coding",
            "content": ["Code must pass ethical tests."],
            "explanation": "Ethical coding ensures digital actions align with moral principles."
          },
          {
            "title": "Guard Privacy",
            "content": ["Protect personal, institutional data."],
            "explanation": "Privacy protection builds trust, ensuring safe digital interactions."
          },
          {
            "title": "No Exploitation",
            "content": ["Use skills to uplift, not harm."],
            "explanation": "Skills should serve the good, preventing harm or exploitation."
          },
          {
            "title": "Learn Without End",
            "content": ["Evolve with the digital world."],
            "explanation": "Continuous learning keeps skills relevant, ensuring ethical contributions."
          },
          {
            "title": "Ensure Fair Access",
            "content": ["Promote equitable tech use."],
            "explanation": "Fair access to technology ensures inclusivity, reducing digital divides."
          },
          {
            "title": "Prioritize Safety",
            "content": ["Design tech for user safety."],
            "explanation": "Safe technology protects users, fostering trust and responsible use."
          },
          {
            "title": "Act Transparently",
            "content": ["Be open in tech practices."],
            "explanation": "Transparency in tech builds trust, ensuring ethical accountability."
          },
          {
            "title": "Value User Trust",
            "content": ["Earn confidence through ethics."],
            "explanation": "Ethical practices build user trust, ensuring reliable technology."
          },
          {
            "title": "Avoid Harmful Bias",
            "content": ["Eliminate bias in tech design."],
            "explanation": "Unbiased tech ensures fairness, preventing discrimination in systems."
          },
          {
            "title": "Promote Sustainability",
            "content": ["Tech should preserve resources."],
            "explanation": "Sustainable tech supports long-term environmental and societal health."
          },
          {
            "title": "Foster Innovation",
            "content": ["Encourage ethical tech creativity."],
            "explanation": "Ethical innovation drives progress, balancing creativity with responsibility."
          },
          {
            "title": "Respect User Rights",
            "content": ["Honor users’ digital freedoms."],
            "explanation": "Respecting rights ensures technology empowers without exploitation."
          },
          {
            "title": "Build for Good",
            "content": ["Tech should serve humanity."],
            "explanation": "Technology for humanity’s benefit fosters progress and well-being."
          },
          {
            "title": "Stay Accountable",
            "content": ["Own tech’s impact, always."],
            "explanation": "Accountability ensures technology aligns with ethical and societal goals."
          },
          {
            "title": "Value Collaboration",
            "content": ["Work together for ethical tech."],
            "explanation": "Collaboration in tech ensures diverse, ethical solutions for all."
          },
          {
            "title": "Seek Feedback",
            "content": ["Learn from users’ experiences."],
            "explanation": "Feedback improves technology, ensuring it meets ethical user needs."
          },
          {
            "title": "Promote Inclusivity",
            "content": ["Tech for all, equitably."],
            "explanation": "Inclusive tech ensures everyone benefits, fostering equality and access."
          },
          {
            "title": "Uphold Integrity",
            "content": ["Act ethically in tech work."],
            "explanation": "Integrity in tech ensures actions align with moral principles."
          },
          {
            "title": "Balance Progress, Ethics",
            "content": ["Innovate with moral clarity."],
            "explanation": "Balancing progress with ethics ensures technology serves the greater good."
          }
        ]
      },
      {
        "title": "Excellence & Learning",
        "subsections": [
          {
            "title": "Daily Growth",
            "content": ["Learn something new every day."],
            "explanation": "Daily learning fosters continuous improvement, building a foundation for greatness."
          },
          {
            "title": "Habit of Excellence",
            "content": ["Small improvements lead to mastery."],
            "explanation": "Consistent small improvements build mastery, elevating personal standards."
          },
          {
            "title": "Curiosity as Fuel",
            "content": ["Questions spark invention."],
            "explanation": "Curiosity drives innovation, turning questions into new discoveries."
          },
          {
            "title": "Growth Over Comparison",
            "content": ["Compete with past self only."],
            "explanation": "Focusing on personal growth fosters progress, avoiding unhealthy comparisons."
          },
          {
            "title": "Fail Forward",
            "content": ["Treat failure as feedback."],
            "explanation": "Failure as feedback promotes learning, turning setbacks into growth."
          },
          {
            "title": "Seek Knowledge",
            "content": ["Pursue wisdom relentlessly."],
            "explanation": "Relentless pursuit of knowledge ensures continuous personal development."
          },
          {
            "title": "Stay Curious",
            "content": ["Always ask, explore, learn."],
            "explanation": "Curiosity fuels discovery, keeping the mind open to new ideas."
          },
          {
            "title": "Embrace Challenges",
            "content": ["Tackle difficulties to grow."],
            "explanation": "Challenges foster resilience, turning obstacles into learning opportunities."
          },
          {
            "title": "Value Feedback",
            "content": ["Learn from others’ insights."],
            "explanation": "Feedback provides guidance, accelerating personal and professional growth."
          },
          {
            "title": "Pursue Mastery",
            "content": ["Aim for skill excellence."],
            "explanation": "Mastery through effort elevates abilities, inspiring others to excel."
          },
          {
            "title": "Stay Humble",
            "content": ["Learn with an open mind."],
            "explanation": "Humility in learning fosters openness, ensuring continuous growth."
          },
          {
            "title": "Build Discipline",
            "content": ["Commit to consistent learning."],
            "explanation": "Disciplined learning ensures steady progress toward mastery and excellence."
          },
          {
            "title": "Act with Purpose",
            "content": ["Learn for meaningful goals."],
            "explanation": "Purposeful learning aligns efforts with impactful personal objectives."
          },
          {
            "title": "Seek Diverse Views",
            "content": ["Learn from varied perspectives."],
            "explanation": "Diverse perspectives enrich understanding, fostering well-rounded growth."
          },
          {
            "title": "Value Reflection",
            "content": ["Assess progress for improvement."],
            "explanation": "Reflection on progress guides learning, ensuring continuous improvement."
          },
          {
            "title": "Stay Persistent",
            "content": ["Keep learning despite setbacks."],
            "explanation": "Persistence in learning overcomes obstacles, driving long-term success."
          },
          {
            "title": "Share Knowledge",
            "content": ["Teach others to grow."],
            "explanation": "Sharing knowledge fosters community growth, amplifying collective learning."
          },
          {
            "title": "Embrace Adaptability",
            "content": ["Adjust to new challenges."],
            "explanation": "Adaptability ensures learning evolves, meeting new demands effectively."
          },
          {
            "title": "Focus on Growth",
            "content": ["Prioritize personal development always."],
            "explanation": "Focusing on growth ensures continuous improvement, building a great life."
          },
          {
            "title": "Value Lifelong Learning",
            "content": ["Never stop seeking wisdom."],
            "explanation": "Lifelong learning keeps the mind sharp, fostering endless growth."
          }
        ]
      }
    ],
    'Hindi': [
      {
        'title': 'मानवता और कठिन परिश्रम',
        'subsections': [
          {
            'title': '1.1 प्रत्येक आत्मा का सम्मान',
            'content': [
              'प्रत्येक व्यक्ति समान गरिमा रखता है; उनके साथ निष्पक्षता और बिना पक्षपात के व्यवहार करें।',
            ],
          },
          {
            'title': '1.2 उद्देश्य के लिए कार्य, प्रशंसा के लिए नहीं',
            'content': [
              'प्रयास आंतरिक सम्मान से प्रेरित होना चाहिए, न कि बाहरी प्रशंसा से।',
            ],
          },
          {
            'title': '1.3 सभी श्रम में गरिमा देखें',
            'content': [
              'कोई कार्य आपके नीचे नहीं है यदि वह बड़े भले के लिए हो।',
            ],
          },
          {
            'title': '1.4 सम्मान में कोई शॉर्टकट नहीं',
            'content': [
              'बिना अखंडता के कोई लाभ आत्मा के लिए हानि है।',
            ],
          },
          {
            'title': '1.5 आज का प्रयास कल का निर्माण करता है',
            'content': [
              'निरंतर, अनुशासित कार्य महानता के बीज बोता है।',
            ],
          },
        ],
      },
      {
        'title': 'अनुशासन और आत्म-नियंत्रण',
        'subsections': [
          {
            'title': '2.1 अपने शब्दों की रक्षा करें',
            'content': [
              'केवल उत्थान या सुधार के लिए बोलें, कभी नीचा दिखाने के लिए नहीं।',
            ],
          },
          {
            'title': '2.2 अपने समय पर नियंत्रण रखें',
            'content': [
              'समय की पाबंदी आत्म-सम्मान और दूसरों के लिए सम्मान का संकेत है।',
            ],
          },
          {
            'title': '2.3 एकाग्रता धन है',
            'content': [
              'अपने मन को व्याकुलता से उसी तरह बचाएं जैसे आप खजाने की रक्षा करते हैं।',
            ],
          },
          {
            'title': '2.4 वर्दी और आचरण',
            'content': [
              'आपका स्वरूप आपके आंतरिक अनुशासन को दर्शाता है।',
            ],
          },
          {
            'title': '2.5 नियमों का सम्मान करें',
            'content': [
              'प्रणाली आपकी ढाल है; इसे तोड़ना सभी को कमजोर करता है।',
            ],
          },
        ],
      },
      {
        'title': 'विश्व धर्मों से ज्ञान (बिना पक्षपात के सार्वभौमिक मूल्य)',
        'subsections': [
          {
            'title': '3.1 हिंदू धर्म',
            'content': [
              'धर्म (कर्तव्य), कर्म (कार्य), अहिंसा (अहिंसा)। पुरस्कार की आसक्ति के बिना कार्य करें।',
            ],
          },
          {
            'title': '3.2 बौद्ध धर्म',
            'content': [
              'सचेतनता, लोभ से वैराग्य, सभी प्राणियों के लिए करुणा।',
            ],
          },
          {
            'title': '3.3 ईसाई धर्म',
            'content': [
              'पड़ोसी से प्रेम, विनम्रता, शत्रुओं के लिए भी क्षमा।',
            ],
          },
          {
            'title': '3.4 इस्लाम',
            'content': [
              'वचन और कर्म में ईमानदारी, दैनिक जीवन में अनुशासन, जरूरतमंदों के लिए उदारता।',
            ],
          },
          {
            'title': '3.5 यहूदी धर्म',
            'content': [
              'अध्ययन के प्रति समर्पण, न्याय के प्रति प्रतिबद्धता, सभी व्यवहारों में सत्य।',
            ],
          },
          {
            'title': '3.6 सिख धर्म',
            'content': [
              'सभी की समानता, मानवता की सेवा, धार्मिकता में निडर साहस।',
            ],
          },
          {
            'title': '3.7 बहाई धर्म',
            'content': [
              'मानवता की एकता, शांति का लक्ष्य, निरंतर सत्य की खोज।',
            ],
          },
        ],
      },
      {
        'title': 'नवाचार और प्रौद्योगिकी नैतिकता',
        'subsections': [
          {
            'title': '4.1 निर्माण करें, विनाश नहीं',
            'content': [
              'प्रौद्योगिकी का उपयोग केवल मूल्य सृजन के लिए करें।',
            ],
          },
          {
            'title': '4.2 नैतिक कोडिंग',
            'content': [
              'कोई भी डिजिटल कार्रवाई नैतिकता की कसौटी पर खरी उतरनी चाहिए।',
            ],
          },
          {
            'title': '4.3 गोपनीयता की रक्षा',
            'content': [
              'व्यक्तिगत और संस्थागत डेटा की रक्षा करें।',
            ],
          },
          {
            'title': '4.4 कोई शोषण नहीं',
            'content': [
              'कौशल उत्थान के लिए एक उपहार है, न कि नुकसान पहुंचाने के लिए।',
            ],
          },
          {
            'title': '4.5 बिना अंत के सीखें',
            'content': [
              'डिजिटल दुनिया रोज विकसित होती है; आपको भी करना चाहिए।',
            ],
          },
        ],
      },
      {
        'title': 'उत्कृष्टता और आजीवन सीखना',
        'subsections': [
          {
            'title': '5.1 दैनिक विकास',
            'content': [
              'हर दिन कुछ नया सीखें।',
            ],
          },
          {
            'title': '5.2 उत्कृष्टता की आदत',
            'content': [
              'छोटे सुधार महारत की ओर ले जाते हैं।',
            ],
          },
          {
            'title': '5.3 जिज्ञासा एक ईंधन',
            'content': [
              'प्रश्न आविष्कार के बीज हैं।',
            ],
          },
          {
            'title': '5.4 तुलना से अधिक विकास',
            'content': [
              'अपने पिछले स्वयं से प्रतिस्पर्धा करें, दूसरों से नहीं।',
            ],
          },
          {
            'title': '5.5 असफलता से आगे बढ़ें',
            'content': [
              'असफलता को प्रतिक्रिया के रूप में लें, अंत के रूप में नहीं।',
            ],
          },
        ],
      },
    ],
    'Tamil': [
      {
        'title': 'மனிதநேயம் மற்றும் கடின உழைப்பு',
        'subsections': [
          {
            'title': '1.1 ஒவ்வொரு ஆன்மாவையும் மதிக்கவும்',
            'content': [
              'ஒவ்வொரு மனிதரும் சமமான கண்ணியத்தைக் கொண்டவர்; அவர்களை பாரபட்சமின்றி நியாயமாக நடத்தவும்.',
            ],
          },
          {
            'title': '1.2 புகழ்ச்சிக்காக அல்ல, நோக்கத்திற்காக உழைக்கவும்',
            'content': [
              'முயற்சி உள் கௌரவத்தால் இயக்கப்பட வேண்டும், வெளிப்புற பாராட்டுகளால் அல்ல.',
            ],
          },
          {
            'title': '1.3 எல்லா உழைப்பிலும் கண்ணியத்தைப் பார்க்கவும்',
            'content': [
              'பெரிய நன்மைக்கு உதவும் எந்த பணியும் உங்களுக்கு கீழானது இல்லை.',
            ],
          },
          {
            'title': '1.4 கௌரவத்தில் குறுக்கு வழி இல்லை',
            'content': [
              'நேர்மையற்ற எந்தவொரு ஆதாயமும் ஆன்மாவுக்கு இழப்பு ஆகும்.',
            ],
          },
          {
            'title': '1.5 இன்றைய முயற்சி நாளையை உருவாக்குகிறது',
            'content': [
              'நிலையான, ஒழுக்கமான உழைப்பு மகத்துவத்தின் விதைகளை விதைக்கிறது.',
            ],
          },
        ],
      },
      {
        'title': 'ஒழுக்கம் மற்றும் சுய-கட்டுப்பாடு',
        'subsections': [
          {
            'title': '2.1 உங்கள் வார்த்தைகளைக் காக்கவும்',
            'content': [
              'உயர்த்துவதற்கு அல்லது மேம்படுத்துவதற்கு மட்டுமே பேசவும், ஒருபோதும் இழிவுபடுத்துவதற்கு அல்ல.',
            ],
          },
          {
            'title': '2.2 உங்கள் நேரத்தை கட்டுப்படுத்தவும்',
            'content': [
              'நேரமின்மை என்பது சுய-மரியாதை மற்றும் மற்றவர்களுக்கு மரியாதை அளிக்கும் அடையாளமாகும்.',
            ],
          },
          {
            'title': '2.3 கவனம் செல்வம்',
            'content': [
              'நீங்கள் ஒரு புதையலை பாதுகாப்பது போல உங்கள் மனதை கவனச்சிதறலில் இருந்து பாதுகாக்கவும்.',
            ],
          },
          {
            'title': '2.4 சீருடை மற்றும் நடத்தை',
            'content': [
              'உங்கள் தோற்றம் உங்கள் உள் ஒழுக்கத்தை பிரதிபலிக்கிறது.',
            ],
          },
          {
            'title': '2.5 விதிகளை மதிக்கவும்',
            'content': [
              'அமைப்பு உங்கள் கேடயம்; அதை உடைப்பது அனைவரையும் பலவீனப்படுத்துகிறது.',
            ],
          },
        ],
      },
      {
        'title': 'உலக மதங்களிலிருந்து ஞானம் (பாரபட்சமற்ற பொதுவான மதிப்புகள்)',
        'subsections': [
          {
            'title': '3.1 இந்து மதம்',
            'content': [
              'தர்மம் (கடமை), கர்மம் (செயல்), அஹிம்சை (வன்முறையின்மை). வெகுமதிக்கு பற்று இல்லாமல் செயல்படவும்.',
            ],
          },
          {
            'title': '3.2 பௌத்தம்',
            'content': [
              'நினைவாற்றல், பேராசையிலிருந்து விடுபடுதல், அனைத்து உயிர்களுக்கும் இரக்கம்.',
            ],
          },
          {
            'title': '3.3 கிறிஸ்தவம்',
            'content': [
              'பிறரை நேசிக்கவும், பணிவு, பகைவர்களுக்கும் மன்னிப்பு.',
            ],
          },
          {
            'title': '3.4 இஸ்லாம்',
            'content': [
              'வார்த்தை மற்றும் செயலில் நேர்மை, தினசரி வாழ்க்கையில் ஒழுக்கம், தேவைப்படுவோருக்கு தாராள மனது.',
            ],
          },
          {
            'title': '3.5 யூத மதம்',
            'content': [
              'படிப்புக்கு அர்ப்பணிப்பு, நீதிக்கு உறுதிப்பாடு, எல்லா நடவடிக்கைகளிலும் உண்மை.',
            ],
          },
          {
            'title': '3.6 சீக்கிய மதம்',
            'content': [
              'அனைவரின் சமத்துவம், மனிதகுலத்திற்கு சேவை, நீதியில் தைரியமான மனோபாவம்.',
            ],
          },
          {
            'title': '3.7 பஹாய் மதம்',
            'content': [
              'மனிதகுலத்தின் ஒற்றுமை, அமைதியே இலக்கு, இடைவிடாத உண்மை தேடல்.',
            ],
          },
        ],
      },
      {
        'title': 'புதுமை மற்றும் தொழில்நுட்ப நெறிமுறைகள்',
        'subsections': [
          {
            'title': '4.1 உருவாக்கவும், அழிக்கவும் வேண்டாம்',
            'content': [
              'தொழில்நுட்பத்தை மதிப்பு உருவாக்குவதற்கு மட்டுமே பயன்படுத்தவும்.',
            ],
          },
          {
            'title': '4.2 நெறிமுறை குறியீடு',
            'content': [
              'எந்தவொரு டிஜிட்டல் செயலும் நெறிமுறைகளின் சோதனையை கடந்திருக்க வேண்டும்.',
            ],
          },
          {
            'title': '4.3 தனியுரிமையை பாதுகாக்கவும்',
            'content': [
              'தனிப்பட்ட மற்றும் நிறுவன தரவை பாதுகாக்கவும்.',
            ],
          },
          {
            'title': '4.4 சுரண்டல் இல்லை',
            'content': [
              'திறமைகள் உயர்த்துவதற்கு ஒரு பரிசு, தீங்கு செய்ய அல்ல.',
            ],
          },
          {
            'title': '4.5 முடிவில்லாமல் கற்றல்',
            'content': [
              'டிஜிட்டல் உலகம் தினமும் உருவாகிறது; நீங்களும் அவ்வாறே செய்ய வேண்டும்.',
            ],
          },
        ],
      },
      {
        'title': 'சிறப்பு மற்றும் வாழ்நாள் முழுவதும் கற்றல்',
        'subsections': [
          {
            'title': '5.1 தினசரி வளர்ச்சி',
            'content': [
              'ஒவ்வொரு நாளும் புதிதாக ஏதாவது கற்றுக்கொள்ளவும்.',
            ],
          },
          {
            'title': '5.2 சிறப்பின் பழக்கம்',
            'content': [
              'சிறிய முன்னேற்றங்கள் மாஸ்டரிக்கு வழிவகுக்கும்.',
            ],
          },
          {
            'title': '5.3 ஆர்வம் ஒரு எரிபொருள்',
            'content': [
              'கேள்விகள் கண்டுபிடிப்பின் விதைகளாகும்.',
            ],
          },
          {
            'title': '5.4 ஒப்பீடு மீது வளர்ச்சி',
            'content': [
              'மற்றவர்களுடன் அல்ல, உங்கள் கடந்தகால சுயத்துடன் போட்டியிடவும்.',
            ],
          },
          {
            'title': '5.5 தோல்வியிலிருந்து முன்னேறவும்',
            'content': [
              'தோல்வியை பின்னூட்டமாக கருதவும், முடிவாக அல்ல.',
            ],
          },
        ],
      },
    ],
  };

  // Colors for chapters
  final List<Color> _categoryColors = [
    const Color(0xFF00c853), // Green
    const Color(0xFF26a69a), // Teal
    const Color(0xFFffa000), // Amber
    const Color(0xFFab47bc), // Purple
    const Color(0xFFef5350), // Red
  ];

  @override
  void initState() {
    super.initState();
    // Initialize chapter TabController
    _chapterTabController = TabController(length: translations['English']!.length, vsync: this);
  }

  @override
  void dispose() {
    _chapterTabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            backgroundColor: const Color(0xFFb71c1c),
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFb71c1c), Color(0xFFd32f2f)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
            title: Row(
              children: [
                // Language selector Dropdown
                Text(
                  'Noble Knights            ',
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 32),
                const Icon(Icons.book, color: Colors.white),
                DropdownButton<String>(
                  value: _selectedLanguage,
                  icon: const Icon(Icons.language, color: Colors.white),
                  dropdownColor: const Color(0xFFb71c1c),
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                  onChanged: (String? newValue) {
                    if (newValue != null) {
                      setState(() {
                        _selectedLanguage = newValue;
                      });
                    }
                  },
                  items: languages.map<DropdownMenuItem<String>>((String lang) {
                    return DropdownMenuItem<String>(
                      value: lang,
                      child: Text(
                        lang,
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
            bottom: TabBar(
              controller: _chapterTabController,
              isScrollable: true,
              indicatorColor: const Color(0xFF00c853),
              labelStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
              unselectedLabelStyle: GoogleFonts.poppins(color: Colors.white70, fontSize: 14),
              tabs: translations[_selectedLanguage]!
                  .asMap()
                  .entries
                  .map((entry) => Tab(text: 'Chapter ${entry.key + 1}: ${entry.value['title'].split(' ').take(2).join(' ')}'))
                  .toList(),
            ),
          ),
        ],
        body: TabBarView(
          controller: _chapterTabController,
          children: translations[_selectedLanguage]!.asMap().entries.map((entry) {
            final chapterIndex = entry.key;
            final chapter = entry.value;
            final colorIndex = chapterIndex % _categoryColors.length;

            return ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                // Fixed image at the top
                Center(
                  child: Image.asset(
                    'assets/images/knights.png',
                    height: 100,
                    width: 100,
                  ),
                ),
                const SizedBox(height: 10),
                ...chapter['subsections'].asMap().entries.map((subEntry) {
                  final subsection = subEntry.value;
                  final subColorIndex =
                  ((colorIndex + subEntry.key) % _categoryColors.length).toInt(); // ✅ Cast to int

                  return Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: Color(0x3300c853), width: 1),
                    ),
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    child: ExpansionTile(
                      title: Text(
                        subsection['title'].toString(),
                        style: GoogleFonts.poppins(
                          color: _categoryColors[subColorIndex],
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      children: (subsection['content'] as List<String>).map<Widget>((point) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '• ',
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF00c853),
                                  fontSize: 14,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  point,
                                  style: GoogleFonts.poppins(
                                    color: Colors.white70,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  );
                }).toList(),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}