import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw clientError('Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || typeof teamId !== 'string' || !mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw clientError('Valid userId and teamId are required');
  }
  if (typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw clientError('A type and positive minutes value are required');
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw clientError('The referenced user or team does not exist', 404);
  return Activity.create({ user: user._id, team: team._id, type: type.trim(), minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw clientError('Team details are required');
  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) throw clientError('A team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw clientError('A team mascot is required');
  if (!Array.isArray(members) || !members.every((member) => typeof member === 'string' && mongoose.isValidObjectId(member))) {
    throw clientError('Members must contain valid user IDs');
  }
  const users = members.length ? await User.find({ _id: { $in: members } }) : [];
  if (users.length !== new Set(members).size) throw clientError('One or more team members do not exist', 404);
  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: users.map((user) => user._id) });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
  ]);
  return totals.map((entry, index) => ({
    teamName: entry.team.name as string,
    totalPoints: entry.totalPoints as number,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw clientError('User not found', 404);
  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focus = user.fitnessGoal || recentActivity?.type;
  if (!focus) return [];
  const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  const reason = user.fitnessGoal
    ? `Matches your ${user.fitnessGoal} fitness goal${recentActivity ? ` and recent ${recentActivity.type} activity` : ''}.`
    : `Based on your recent ${recentActivity?.type} activity.`;
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
