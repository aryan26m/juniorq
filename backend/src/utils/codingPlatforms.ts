import axios from 'axios';

interface CodingPlatformStatus {
  completed: boolean;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'unknown';
  score?: number;
  runtime?: number;
  memory?: number;
  lastChecked: Date;
}

// LeetCode API integration
const checkLeetCodeStatus = async (username: string, problemId: string): Promise<CodingPlatformStatus> => {
  try {
    // LeetCode GraphQL API
    const query = `
      query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { username }
    });

    // Note: LeetCode doesn't provide direct problem completion status via public API
    // This would require scraping or using unofficial APIs
    // For now, return a mock response
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  } catch (error) {
    console.error('Error checking LeetCode status:', error);
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  }
};

// HackerRank API integration
const checkHackerRankStatus = async (username: string, problemId: string): Promise<CodingPlatformStatus> => {
  try {
    // HackerRank doesn't provide public API for user submissions
    // This would require scraping or using unofficial methods
    const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/submissions`);
    
    // Mock response for now
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  } catch (error) {
    console.error('Error checking HackerRank status:', error);
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  }
};

// CodeChef API integration
const checkCodeChefStatus = async (username: string, problemId: string): Promise<CodingPlatformStatus> => {
  try {
    // CodeChef API endpoint
    const response = await axios.get(`https://www.codechef.com/api/users/${username}/submissions`);
    
    // Mock response for now
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  } catch (error) {
    console.error('Error checking CodeChef status:', error);
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  }
};

// Main function to check coding platform status
export const checkCodingPlatformStatus = async (
  platform: 'leetcode' | 'hackerrank' | 'codechef',
  username: string,
  problemId: string
): Promise<CodingPlatformStatus> => {
  if (!username) {
    return {
      completed: false,
      status: 'unknown',
      lastChecked: new Date()
    };
  }

  switch (platform) {
    case 'leetcode':
      return await checkLeetCodeStatus(username, problemId);
    case 'hackerrank':
      return await checkHackerRankStatus(username, problemId);
    case 'codechef':
      return await checkCodeChefStatus(username, problemId);
    default:
      return {
        completed: false,
        status: 'unknown',
        lastChecked: new Date()
      };
  }
};

// Verify coding platform username
export const verifyCodingPlatformUsername = async (
  platform: 'leetcode' | 'hackerrank' | 'codechef',
  username: string
): Promise<boolean> => {
  try {
    switch (platform) {
      case 'leetcode':
        const leetcodeResponse = await axios.get(`https://leetcode.com/${username}`);
        return leetcodeResponse.status === 200;
      
      case 'hackerrank':
        const hackerrankResponse = await axios.get(`https://www.hackerrank.com/${username}`);
        return hackerrankResponse.status === 200;
      
      case 'codechef':
        const codechefResponse = await axios.get(`https://www.codechef.com/users/${username}`);
        return codechefResponse.status === 200;
      
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
};

// Get user statistics from coding platforms
export const getCodingPlatformStats = async (
  platform: 'leetcode' | 'hackerrank' | 'codechef',
  username: string
) => {
  try {
    switch (platform) {
      case 'leetcode':
        const query = `
          query userProfile($username: String!) {
            matchedUser(username: $username) {
              profile {
                ranking
                realName
                aboutMe
                reputation
                reputationDiff
                postViewCount
                postCount
                solutionCount
                categoryDiscussCount
              }
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `;

        const response = await axios.post('https://leetcode.com/graphql', {
          query,
          variables: { username }
        });

        const data = response.data.data.matchedUser;
        return {
          problemsSolved: data.submitStatsGlobal.acSubmissionNum.reduce((sum: number, item: any) => sum + item.count, 0),
          ranking: data.profile.ranking,
          reputation: data.profile.reputation
        };

      case 'hackerrank':
        // Mock data for HackerRank
        return {
          problemsSolved: 0,
          ranking: 0,
          reputation: 0
        };

      case 'codechef':
        // Mock data for CodeChef
        return {
          problemsSolved: 0,
          ranking: 0,
          reputation: 0
        };

      default:
        return {
          problemsSolved: 0,
          ranking: 0,
          reputation: 0
        };
    }
  } catch (error) {
    console.error(`Error getting ${platform} stats:`, error);
    return {
      problemsSolved: 0,
      ranking: 0,
      reputation: 0
    };
  }
}; 