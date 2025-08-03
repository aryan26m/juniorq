import User from '../models/User';
import Assignment from '../models/Assignment';
import AssignmentSubmission from '../models/AssignmentSubmission';
import Session from '../models/Session';
import { checkCodingPlatformStatus } from './codingPlatforms';

// Nightly leaderboard update
export const updateDailyLeaderboard = async () => {
  try {
    console.log('Starting daily leaderboard update...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's top performers
    const topPerformers = await User.aggregate([
      {
        $match: {
          'stats.lastActive': { $gte: today, $lt: tomorrow }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          stats: 1,
          totalPoints: { $sum: ['$stats.totalPoints', '$stats.streakDays'] }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Store leaderboard data (you might want to create a separate collection for this)
    console.log('Daily leaderboard updated:', topPerformers.length, 'users');
    
    return topPerformers;
  } catch (error) {
    console.error('Error updating daily leaderboard:', error);
  }
};

// Check assignment completion status
export const checkAssignmentCompletions = async () => {
  try {
    console.log('Checking assignment completions...');
    
    const pendingSubmissions = await AssignmentSubmission.find({
      status: 'pending'
    }).populate('assignment student');

    for (const submission of pendingSubmissions) {
      const assignment = submission.assignment as any;
      const student = submission.student as any;
      
      if (assignment.platform) {
        // Check coding platform status
        const status = await checkCodingPlatformStatus(
          assignment.platform,
          student.codingPlatforms[assignment.platform]?.username,
          assignment.problemId
        );

        if (status.completed) {
          submission.status = 'completed';
          submission.platformStatus = status.status as any;
          submission.platformScore = status.score;
          submission.platformRuntime = status.runtime;
          submission.platformMemory = status.memory;
          submission.completedAt = new Date();
          
          // Award points
          if (status.status === 'accepted') {
            submission.pointsAwarded = assignment.points;
            
            // Update user stats
            await User.findByIdAndUpdate(student._id, {
              $inc: {
                'stats.assignmentsCompleted': 1,
                'stats.totalPoints': assignment.points
              }
            });
          }
          
          await submission.save();
        }
      }
    }
    
    console.log('Assignment completion check finished');
  } catch (error) {
    console.error('Error checking assignment completions:', error);
  }
};

// Update user streaks
export const updateUserStreaks = async () => {
  try {
    console.log('Updating user streaks...');
    
    const users = await User.find({});
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const user of users) {
      const lastActive = new Date(user.stats.lastActive);
      lastActive.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // User was active yesterday, increment streak
        user.stats.streakDays += 1;
      } else if (daysDiff > 1) {
        // User missed a day, reset streak
        user.stats.streakDays = 0;
      }
      
      await user.save();
    }
    
    console.log('User streaks updated');
  } catch (error) {
    console.error('Error updating user streaks:', error);
  }
};

// Send session reminders
export const sendSessionReminders = async () => {
  try {
    console.log('Sending session reminders...');
    
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    const upcomingSessions = await Session.find({
      startTime: { $gte: now, $lte: oneHourFromNow },
      status: 'scheduled',
      reminderSent: false
    }).populate('host participants');
    
    for (const session of upcomingSessions) {
      // TODO: Send email/push notifications to participants
      console.log(`Sending reminder for session: ${session.title}`);
      
      session.reminderSent = true;
      session.reminderSentAt = new Date();
      await session.save();
    }
    
    console.log('Session reminders sent');
  } catch (error) {
    console.error('Error sending session reminders:', error);
  }
};

// Start all background tasks
export const startBackgroundTasks = () => {
  console.log('Starting background tasks...');
  
  // Run daily leaderboard update at midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updateDailyLeaderboard();
      updateUserStreaks();
    }
  }, 60000); // Check every minute
  
  // Check assignment completions every 5 minutes
  setInterval(() => {
    checkAssignmentCompletions();
  }, 5 * 60 * 1000);
  
  // Send session reminders every 15 minutes
  setInterval(() => {
    sendSessionReminders();
  }, 15 * 60 * 1000);
  
  console.log('Background tasks started');
}; 