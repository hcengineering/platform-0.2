import {addDays, eachDayOfInterval, endOfMonth, endOfWeek, isToday, startOfMonth, startOfWeek} from "date-fns";
import {assign, createMachine} from "xstate";
import {useMachine} from "xstate-svelte";


const loadHabits = () =>
  (JSON.parse(<string>localStorage.getItem('habits')) ?? []) as Habit[];

const saveHabits = (habits: Habit[]) =>
  localStorage.setItem('habits', JSON.stringify(habits));

export interface Habit {
  name: string;
}

export interface AppContext {
  currentDate: Date;
  currentMonth: Date[],
  habits: Habit[];
}

export type AppEvent =
  | { type: 'NAVIGATE'; direction: 'BACK' | 'HOME' | 'FORWARD' }
  | { type: 'EDIT' }
  | { type: "CANCEL_EDIT" }
  | { type: "ADD_HABIT"; habit: Habit }
  | { type: "RESET" };

const buildContext = (date: Date, habits: Habit[]): AppContext => ({
  currentDate: date,
  currentMonth: eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), {weekStartsOn: 1}),
    end: endOfWeek(endOfMonth(date), {weekStartsOn: 1})
  }),
  habits,
});

export const habitMachine = createMachine<AppContext, AppEvent>({
  initial: "idle",
  context: buildContext(new Date(), loadHabits()),
  states: {
    idle: {
      on: {
        NAVIGATE: {
          actions: assign((ctx, evt) => {
            switch (evt.direction) {
              case "BACK":
                return buildContext(
                  addDays(ctx.currentMonth[0], -1),
                  ctx.habits
                );
              case "HOME":
                return buildContext(new Date(), ctx.habits);
              case "FORWARD":
                return buildContext(
                  addDays(ctx.currentMonth[ctx.currentMonth.length - 1], 1),
                  ctx.habits
                );
            }
          }),
          cond: (ctx, evt) =>
            !(evt.direction === "HOME" && isToday(ctx.currentDate)),
        },
        EDIT: "edit",
        RESET: {
          actions: [
            assign(buildContext(new Date(), [])),
            () => localStorage.clear(),
          ],
        },
      },
    },
    edit: {
      on: {
        CANCEL_EDIT: "idle",
        ADD_HABIT: {
          target: "idle",
          actions: [
            assign({
              habits: (ctx, evt) => ctx.habits.concat([evt.habit]),
            }),
            (ctx) => saveHabits(ctx.habits),
          ],
        },
      },
    },
  },
});

export const {state, send} = useMachine(habitMachine);

