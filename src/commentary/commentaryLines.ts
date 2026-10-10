import { CommentaryEvent, CommentatorPersona } from '../types/game';

export interface CommentaryLine {
  id: string;
  event: CommentaryEvent;
  persona?: CommentatorPersona; // if not set, applies to all
  text: string;
}

export const COMMENTARY_DATABASE: CommentaryLine[] = [
  // ================= RUN_START =================
  {
    id: 'start_hype_1',
    event: 'RUN_START',
    persona: 'HYPE',
    text: "Alright, snake squad! Let's see how long we can survive this time!",
  },
  {
    id: 'start_hype_2',
    event: 'RUN_START',
    persona: 'HYPE',
    text: "And we are rolling! Clean board, fresh appetite, let's get those apples!",
  },
  {
    id: 'start_hype_3',
    event: 'RUN_START',
    persona: 'HYPE',
    text: "Game on, gamers! Can this run be the record breaker? Time to find out!",
  },
  {
    id: 'start_hype_4',
    event: 'RUN_START',
    persona: 'HYPE',
    text: "Hands on the controls, full focus mode engaged! Let's get it!",
  },
  {
    id: 'start_hype_5',
    event: 'RUN_START',
    persona: 'HYPE',
    text: "New run, new challenge! How far do you think we'll get this time?",
  },
  {
    id: 'start_funny_1',
    event: 'RUN_START',
    persona: 'FUNNY',
    text: "Here we go again! A tiny green noodle on a mission to eat everything in sight.",
  },
  {
    id: 'start_funny_2',
    event: 'RUN_START',
    persona: 'FUNNY',
    text: "Welcome back! Reminder to the snake: walls are made of solid concrete, don't kiss them.",
  },
  {
    id: 'start_funny_3',
    event: 'RUN_START',
    persona: 'FUNNY',
    text: "Another run! My doctor told me to watch my cholesterol, but I'm watching this snake eat apples instead.",
  },
  {
    id: 'start_funny_4',
    event: 'RUN_START',
    persona: 'FUNNY',
    text: "Fresh start! Zero apples eaten, zero walls smashed... for now.",
  },
  {
    id: 'start_analyst_1',
    event: 'RUN_START',
    persona: 'ANALYST',
    text: "Beginning of run #{runCount}. Full grid clearance available. Let's establish efficient early-game routing.",
  },
  {
    id: 'start_analyst_2',
    event: 'RUN_START',
    persona: 'ANALYST',
    text: "Starting sequence initialized. Objective is maximizing apple density before entering high congestion.",
  },

  // ================= FOOD_EAT =================
  {
    id: 'food_hype_1',
    event: 'FOOD_EAT',
    persona: 'HYPE',
    text: "Nice snack! That snake is getting bigger, and things are about to get interesting!",
  },
  {
    id: 'food_hype_2',
    event: 'FOOD_EAT',
    persona: 'HYPE',
    text: "Chomp! Another crisp apple in the bank!",
  },
  {
    id: 'food_hype_3',
    event: 'FOOD_EAT',
    persona: 'HYPE',
    text: "Delicious! Score climbs to {score}!",
  },
  {
    id: 'food_hype_4',
    event: 'FOOD_EAT',
    persona: 'HYPE',
    text: "Gobbled it right up! The momentum is building!",
  },
  {
    id: 'food_hype_5',
    event: 'FOOD_EAT',
    persona: 'HYPE',
    text: "Boom! Clean bite! Keep that engine purring!",
  },
  {
    id: 'food_funny_1',
    event: 'FOOD_EAT',
    persona: 'FUNNY',
    text: "Munch! That apple didn't even see it coming.",
  },
  {
    id: 'food_funny_2',
    event: 'FOOD_EAT',
    persona: 'FUNNY',
    text: "An apple a day keeps the game over screen away!",
  },
  {
    id: 'food_funny_3',
    event: 'FOOD_EAT',
    persona: 'FUNNY',
    text: "Zero calories, 100% pure green reptile power.",
  },
  {
    id: 'food_funny_4',
    event: 'FOOD_EAT',
    persona: 'FUNNY',
    text: "Swallowed whole! Who needs chewing anyway?",
  },
  {
    id: 'food_analyst_1',
    event: 'FOOD_EAT',
    persona: 'ANALYST',
    text: "Optimal pickup. Current score is {score}. Grid occupancy remains well within safe margins.",
  },
  {
    id: 'food_analyst_2',
    event: 'FOOD_EAT',
    persona: 'ANALYST',
    text: "Target acquired and converted. Snake length expanded to {length} tiles.",
  },

  // ================= COMBO_STREAK =================
  {
    id: 'combo_hype_1',
    event: 'COMBO_STREAK',
    persona: 'HYPE',
    text: "Quick double-tap! That was lightning-fast apple hunting!",
  },
  {
    id: 'combo_hype_2',
    event: 'COMBO_STREAK',
    persona: 'HYPE',
    text: "Look at that speed! Three apples down in seconds! He's on fire!",
  },
  {
    id: 'combo_hype_3',
    event: 'COMBO_STREAK',
    persona: 'HYPE',
    text: "Snack attack combo! The pathing right now is completely dialed in!",
  },
  {
    id: 'combo_funny_1',
    event: 'COMBO_STREAK',
    persona: 'FUNNY',
    text: "Someone get this snake a napkin! Pure ravenous speed!",
  },
  {
    id: 'combo_funny_2',
    event: 'COMBO_STREAK',
    persona: 'FUNNY',
    text: "Speed eating contest champion right here! Don't blink or you'll miss the buffet!",
  },
  {
    id: 'combo_analyst_1',
    event: 'COMBO_STREAK',
    persona: 'ANALYST',
    text: "Rapid sequential food spawns handled with minimal pathing overhead. Very clean execution.",
  },

  // ================= GROWTH_MILESTONE =================
  {
    id: 'growth_hype_1',
    event: 'GROWTH_MILESTONE',
    persona: 'HYPE',
    text: "Whoa, look at the size of this snake now! It's turning into a complete unit!",
  },
  {
    id: 'growth_hype_2',
    event: 'GROWTH_MILESTONE',
    persona: 'HYPE',
    text: "That tail is stretching across the entire grid! Real estate is getting expensive!",
  },
  {
    id: 'growth_funny_1',
    event: 'GROWTH_MILESTONE',
    persona: 'FUNNY',
    text: "Our little worm has officially graduated to full-blown Anaconda status!",
  },
  {
    id: 'growth_funny_2',
    event: 'GROWTH_MILESTONE',
    persona: 'FUNNY',
    text: "Okay, you're looking thicc now! Don't trip over your own back feet... wait, snakes don't have feet.",
  },
  {
    id: 'growth_analyst_1',
    event: 'GROWTH_MILESTONE',
    persona: 'ANALYST',
    text: "Length reached {length}. Tail latency is now a critical factor in open route calculations.",
  },

  // ================= NEAR_MISS =================
  {
    id: 'near_miss_hype_1',
    event: 'NEAR_MISS',
    persona: 'HYPE',
    text: "Whoa, that was close! One tiny millimeter and this run could be over!",
  },
  {
    id: 'near_miss_hype_2',
    event: 'NEAR_MISS',
    persona: 'HYPE',
    text: "Threading the needle! Inches away from disaster! What a clutch turn!",
  },
  {
    id: 'near_miss_hype_3',
    event: 'NEAR_MISS',
    persona: 'HYPE',
    text: "Heart attack moment right there! My pulse just spiked to 180!",
  },
  {
    id: 'near_miss_hype_4',
    event: 'NEAR_MISS',
    persona: 'HYPE',
    text: "He grazed that wall like a racecar driver! Absolutely unreal reflexes!",
  },
  {
    id: 'near_miss_funny_1',
    event: 'NEAR_MISS',
    persona: 'FUNNY',
    text: "I almost swallowed my tongue! That wall gave us a high-five!",
  },
  {
    id: 'near_miss_funny_2',
    event: 'NEAR_MISS',
    persona: 'FUNNY',
    text: "Did you feel that breeze? That was the grim reaper waving at us.",
  },
  {
    id: 'near_miss_funny_3',
    event: 'NEAR_MISS',
    persona: 'FUNNY',
    text: "Painting the walls with snake scales! Don't do that to my blood pressure, buddy!",
  },
  {
    id: 'near_miss_analyst_1',
    event: 'NEAR_MISS',
    persona: 'ANALYST',
    text: "High-risk maneuver executed with single-cell tolerance. A razor-thin evasion.",
  },

  // ================= DANGER_ZONE =================
  {
    id: 'danger_hype_1',
    event: 'DANGER_ZONE',
    persona: 'HYPE',
    text: "We are deep in the danger zone now! Grid space is disappearing fast!",
  },
  {
    id: 'danger_hype_2',
    event: 'DANGER_ZONE',
    persona: 'HYPE',
    text: "Look at the board! There is barely room to breathe! Every move is life or death!",
  },
  {
    id: 'danger_funny_1',
    event: 'DANGER_ZONE',
    persona: 'FUNNY',
    text: "It's getting crowded in here! Anyone got a shoehorn to help squeeze through?",
  },
  {
    id: 'danger_funny_2',
    event: 'DANGER_ZONE',
    persona: 'FUNNY',
    text: "This is starting to look like rush hour traffic on a Friday afternoon.",
  },
  {
    id: 'danger_analyst_1',
    event: 'DANGER_ZONE',
    persona: 'ANALYST',
    text: "Grid density is critical. Switching algorithmic priority from greedy food seeking to tail-following survival.",
  },

  // ================= SCORE_MILESTONE =================
  {
    id: 'score_10_hype',
    event: 'SCORE_MILESTONE',
    persona: 'HYPE',
    text: "Double digits on the board! Score reaches {score}! We're just warming up!",
  },
  {
    id: 'score_25_hype',
    event: 'SCORE_MILESTONE',
    persona: 'HYPE',
    text: "Twenty-five points locked in! This snake is cruising with pure style!",
  },
  {
    id: 'score_50_hype',
    event: 'SCORE_MILESTONE',
    persona: 'HYPE',
    text: "Half a century! Fifty points! What a sensational performance so far!",
  },
  {
    id: 'score_75_hype',
    event: 'SCORE_MILESTONE',
    persona: 'HYPE',
    text: "Seventy-five! The crowd is on their feet! This run is legendary!",
  },
  {
    id: 'score_100_hype',
    event: 'SCORE_MILESTONE',
    persona: 'HYPE',
    text: "Triple digits! ONE HUNDRED POINTS! Absolute masterclass of snake navigation!",
  },
  {
    id: 'score_milestone_funny_1',
    event: 'SCORE_MILESTONE',
    persona: 'FUNNY',
    text: "Score is {score}! This snake eats more fruit than a whole orchard farmer!",
  },
  {
    id: 'score_milestone_funny_2',
    event: 'SCORE_MILESTONE',
    persona: 'FUNNY',
    text: "Hitting {score}! If apples were gold coins, we'd be retiring in the Bahamas!",
  },
  {
    id: 'score_milestone_analyst_1',
    event: 'SCORE_MILESTONE',
    persona: 'ANALYST',
    text: "Milestone confirmed at {score} points. Path efficiency index remains stellar.",
  },

  // ================= NEW_HIGH_SCORE =================
  {
    id: 'new_high_hype_1',
    event: 'NEW_HIGH_SCORE',
    persona: 'HYPE',
    text: "NEW ALL-TIME RECORD! Look at that score! We just shattered the personal best!",
  },
  {
    id: 'new_high_hype_2',
    event: 'NEW_HIGH_SCORE',
    persona: 'HYPE',
    text: "HISTORY IN THE MAKING! A brand new high score of {score}! Absolutely incredible!",
  },
  {
    id: 'new_high_funny_1',
    event: 'NEW_HIGH_SCORE',
    persona: 'FUNNY',
    text: "Hold the front page! Call the press! We just set a brand new personal record!",
  },
  {
    id: 'new_high_analyst_1',
    event: 'NEW_HIGH_SCORE',
    persona: 'ANALYST',
    text: "Record benchmark surpassed. Current run has achieved new session best score of {score}.",
  },

  // ================= TIME_SURVIVAL =================
  {
    id: 'time_hype_1',
    event: 'TIME_SURVIVAL',
    persona: 'HYPE',
    text: "Still standing after all this time! The endurance on this run is off the charts!",
  },
  {
    id: 'time_funny_1',
    event: 'TIME_SURVIVAL',
    persona: 'FUNNY',
    text: "This snake has survived longer than my last gym membership! Respect!",
  },
  {
    id: 'time_analyst_1',
    event: 'TIME_SURVIVAL',
    persona: 'ANALYST',
    text: "Elapsed run time exceeds {time} seconds. Exceptional state stability sustained.",
  },

  // ================= GAME_OVER_WALL =================
  {
    id: 'wall_hype_1',
    event: 'GAME_OVER_WALL',
    persona: 'HYPE',
    text: "Ouch! Direct hit into the border! That wall was not budging!",
  },
  {
    id: 'wall_hype_2',
    event: 'GAME_OVER_WALL',
    persona: 'HYPE',
    text: "Oh no! We crashed into the boundary! But what a valiant effort!",
  },
  {
    id: 'wall_funny_1',
    event: 'GAME_OVER_WALL',
    persona: 'FUNNY',
    text: "Boom! Face first into the wall! Someone check that perimeter for snake dents!",
  },
  {
    id: 'wall_funny_2',
    event: 'GAME_OVER_WALL',
    persona: 'FUNNY',
    text: "And that, ladies and gentlemen, is why we wear seatbelts. Rest in pieces, green buddy.",
  },
  {
    id: 'wall_funny_3',
    event: 'GAME_OVER_WALL',
    persona: 'FUNNY',
    text: "Wall inspection completed: yes, it is still solid concrete. Thanks for testing it with your face!",
  },
  {
    id: 'wall_analyst_1',
    event: 'GAME_OVER_WALL',
    persona: 'ANALYST',
    text: "Run terminated due to boundary perimeter collision. Final score registered at {score}.",
  },

  // ================= GAME_OVER_SELF =================
  {
    id: 'self_hype_1',
    event: 'GAME_OVER_SELF',
    persona: 'HYPE',
    text: "Oh no! He bit his own tail! The ultimate betrayal!",
  },
  {
    id: 'self_hype_2',
    event: 'GAME_OVER_SELF',
    persona: 'HYPE',
    text: "Self-collision! Got tangled up in his own success! What a dramatic finish!",
  },
  {
    id: 'self_funny_1',
    event: 'GAME_OVER_SELF',
    persona: 'FUNNY',
    text: "You tasted yourself and found out you taste like chicken! Don't bite your own tail, man!",
  },
  {
    id: 'self_funny_2',
    event: 'GAME_OVER_SELF',
    persona: 'FUNNY',
    text: "Friendly fire! That was your own tail, not a red apple! Needs glasses immediately!",
  },
  {
    id: 'self_analyst_1',
    event: 'GAME_OVER_SELF',
    persona: 'ANALYST',
    text: "Self-intersection detected in a tight coil loop. Run concluded with {score} points.",
  },

  // ================= AUTO_RESTART =================
  {
    id: 'restart_hype_1',
    event: 'AUTO_RESTART',
    persona: 'HYPE',
    text: "Oh no! We crashed! But we're not done yet. Let's jump straight into another run!",
  },
  {
    id: 'restart_hype_2',
    event: 'AUTO_RESTART',
    persona: 'HYPE',
    text: "Shake it off, champ! Resetting the board and dropping straight back into the action!",
  },
  {
    id: 'restart_hype_3',
    event: 'AUTO_RESTART',
    persona: 'HYPE',
    text: "No time to cry over spilled apples! Run number {runCount} is live right now!",
  },
  {
    id: 'restart_funny_1',
    event: 'AUTO_RESTART',
    persona: 'FUNNY',
    text: "Dust yourself off, reload the tape, and let's try not to eat our own tail this time!",
  },
  {
    id: 'restart_funny_2',
    event: 'AUTO_RESTART',
    persona: 'FUNNY',
    text: "Round two! Or round fifty, who is counting anyway? Let's get it!",
  },
  {
    id: 'restart_analyst_1',
    event: 'AUTO_RESTART',
    persona: 'ANALYST',
    text: "Automated reset sequence executed. Re-initiating fresh game state for run #{runCount}.",
  },

  // ================= IDLE_THOUGHT =================
  {
    id: 'idle_hype_1',
    event: 'IDLE_THOUGHT',
    persona: 'HYPE',
    text: "Cruising smooth! The snake is focused and eyeing the next target!",
  },
  {
    id: 'idle_hype_2',
    event: 'IDLE_THOUGHT',
    persona: 'HYPE',
    text: "Look at that score! Can we beat the personal record? Stay tuned!",
  },
  {
    id: 'idle_funny_1',
    event: 'IDLE_THOUGHT',
    persona: 'FUNNY',
    text: "I wonder if snakes dream about apple pies. Probably.",
  },
  {
    id: 'idle_funny_2',
    event: 'IDLE_THOUGHT',
    persona: 'FUNNY',
    text: "Just slithering along, living the best noodle life possible.",
  },
  {
    id: 'idle_analyst_1',
    event: 'IDLE_THOUGHT',
    persona: 'ANALYST',
    text: "Steady state traversal observed. Grid partition remains favorable for continuous pathing.",
  },

  // ================= AUTOPLAY_TOGGLE =================
  {
    id: 'autoplay_on_hype',
    event: 'AUTOPLAY_TOGGLE',
    persona: 'HYPE',
    text: "Auto-Play running! Look at that smooth steering and laser focus!",
  },
  {
    id: 'autoplay_off_hype',
    event: 'AUTOPLAY_TOGGLE',
    persona: 'HYPE',
    text: "Manual controls engaged! Hands on the keys, let's take control!",
  },
];
