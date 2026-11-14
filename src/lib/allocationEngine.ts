import { Hostel, Room, StudentApplication, AllocationResult, LifestylePreferences, RoomOccupancy, AllocationMode } from './types';

export interface AllocationRunSummary {
  totalProcessed: number;
  allocatedCount: number;
  waitlistedCount: number;
  allocations: AllocationResult[];
  waitlist: {
    studentId: string;
    studentName: string;
    regNo: string;
    rank: number;
    reason: string;
  }[];
  satisfactionRate: number; // Percentage of 1st choice matches
  friendPairsAllocated: number;
}

// Calculate lifestyle compatibility score across all 8 dimensions (0 - 100%)
export function calculateLifestyleCompatibility(
  s1?: LifestylePreferences,
  s2?: LifestylePreferences
): number {
  if (!s1 || !s2) return 75; // baseline

  let score = 40; // baseline points

  // 1. Sleep Schedule (Weight: 15)
  if (s1.sleepSchedule === s2.sleepSchedule) score += 15;
  else if (s1.sleepSchedule === 'flexible' || s2.sleepSchedule === 'flexible') score += 10;
  else score -= 10; // direct conflict (Early Bird vs Night Owl)

  // 2. Music Preferences (Weight: 10)
  if (s1.musicPreference === s2.musicPreference) score += 10;
  else if (
    (s1.musicPreference === 'prefer_silence' && s2.musicPreference === 'loud_music') ||
    (s1.musicPreference === 'loud_music' && s2.musicPreference === 'prefer_silence')
  ) {
    score -= 10;
  } else {
    score += 5;
  }

  // 3. Cleanliness (Weight: 10)
  if (s1.cleanliness === s2.cleanliness) score += 10;
  else if (
    (s1.cleanliness === 'very_clean' && s2.cleanliness === 'flexible') ||
    (s1.cleanliness === 'flexible' && s2.cleanliness === 'very_clean')
  ) {
    score -= 5;
  } else {
    score += 5;
  }

  // 4. Social Behaviour (Weight: 10)
  if (s1.socialBehaviour === s2.socialBehaviour) score += 10;
  else if (s1.socialBehaviour === 'ambivert' || s2.socialBehaviour === 'ambivert') score += 8;
  else score += 4; // Introvert + Extrovert can coexist fine

  // 5. Study Habits (Weight: 10)
  if (s1.studyHabits === s2.studyHabits) score += 10;
  else if (s1.studyHabits === 'flexible' || s2.studyHabits === 'flexible') score += 7;
  else score -= 5;

  // 6. Daily Routine (Weight: 10)
  if (s1.dailyRoutine === s2.dailyRoutine) score += 10;
  else if (s1.dailyRoutine === 'flexible' || s2.dailyRoutine === 'flexible') score += 6;

  // 7. Food Habits (Weight: 10)
  if (s1.foodHabits === s2.foodHabits) score += 10;
  else if (s1.foodHabits === 'no_preference' || s2.foodHabits === 'no_preference') score += 8;
  else score += 4;

  // 8. Cultural & Personal Compatibility (Weight: 15)
  if (s1.culturalPersonal && s2.culturalPersonal) {
    if (s1.culturalPersonal.festivalParticipation === s2.culturalPersonal.festivalParticipation) {
      score += 5;
    }
    if (
      s1.culturalPersonal.languagePreferences &&
      s2.culturalPersonal.languagePreferences &&
      (s1.culturalPersonal.languagePreferences.includes('English') && s2.culturalPersonal.languagePreferences.includes('English') ||
       s1.culturalPersonal.languagePreferences.includes('Hindi') && s2.culturalPersonal.languagePreferences.includes('Hindi'))
    ) {
      score += 10;
    } else {
      score += 5;
    }
  }

  return Math.min(99, Math.max(35, Math.round(score)));
}

// Automated Multi-Constraint Allocation Engine
export function runAllocationEngine(
  applications: StudentApplication[],
  hostels: Hostel[],
  rooms: Room[]
): AllocationRunSummary {
  // 1. Filter verified & fee-cleared eligible students
  const eligibleApps = applications.filter(
    (app) => app.feeCleared && app.cgpa >= 6.0 && app.status !== 'rejected'
  );

  // Sort priority: Medical/Accessibility first, then higher CGPA (merit priority)
  const sortedApps = [...eligibleApps].sort((a, b) => {
    if (a.medicalAccessibilityNeeded && !b.medicalAccessibilityNeeded) return -1;
    if (!a.medicalAccessibilityNeeded && b.medicalAccessibilityNeeded) return 1;
    return b.cgpa - a.cgpa;
  });

  const allocations: AllocationResult[] = [];
  const waitlist: AllocationRunSummary['waitlist'] = [];
  const allocatedStudentIds = new Set<string>();

  // Clone rooms to track available bed slots during the allocation run
  const bedTracker = rooms.map((r) => ({
    ...r,
    availableSlots: r.availableBeds,
    occupants: [] as { student: StudentApplication }[],
  }));

  let firstChoiceMatches = 0;
  let friendPairsAllocated = 0;

  // =========================================================================
  // PHASE 1: PROCESS FRIEND-BASED ALLOCATION REQUESTS (MUTUAL PAIRINGS)
  // =========================================================================
  const processedFriendPairs = new Set<string>();

  for (const app of sortedApps) {
    if (allocatedStudentIds.has(app.studentId)) continue;

    if (app.allocationMode === 'friend' && app.friendRequest && app.friendRequest.status === 'both_approved') {
      const targetRegNo = app.friendRequest.targetRegNo;
      const pairKey = [app.regNo, targetRegNo].sort().join('_');

      if (!processedFriendPairs.has(pairKey)) {
        // Find friend application
        const friendApp = sortedApps.find(a => a.regNo === targetRegNo);

        if (friendApp && !allocatedStudentIds.has(friendApp.studentId)) {
          // Both students must match gender
          if (app.gender === friendApp.gender) {
            const allowedHostelIds = hostels
              .filter((h) => h.gender === app.gender || h.gender === 'Any')
              .map((h) => h.id);

            // Find a room with at least 2 vacant slots that matches their preferences
            const candidateRooms = bedTracker.filter((r) => {
              if (!allowedHostelIds.includes(r.hostelId)) return false;
              if (r.availableSlots < 2) return false;
              // Check occupancy / seater match (2-seater or 3-seater)
              if (app.preferredOccupancy && r.seater !== app.preferredOccupancy && r.seater < 2) return false;
              // Check accessibility
              if ((app.medicalAccessibilityNeeded || friendApp.medicalAccessibilityNeeded) && r.floor > 1 && !r.isAccessible) {
                return false;
              }
              return true;
            });

            if (candidateRooms.length > 0) {
              const bestRoom = candidateRooms[0];
              const compScore = calculateLifestyleCompatibility(app.lifestyle, friendApp.lifestyle);

              // Allocate Student A
              bestRoom.availableSlots -= 1;
              bestRoom.occupants.push({ student: app });
              const bedA = `${bestRoom.hostelName.split(' ')[0]}-${bestRoom.roomNumber}-B${bestRoom.seater - bestRoom.availableSlots}`;
              
              // Allocate Student B
              bestRoom.availableSlots -= 1;
              bestRoom.occupants.push({ student: friendApp });
              const bedB = `${bestRoom.hostelName.split(' ')[0]}-${bestRoom.roomNumber}-B${bestRoom.seater - bestRoom.availableSlots}`;

              const now = new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              allocations.push({
                id: `alloc-${app.regNo}`,
                studentId: app.studentId,
                studentName: app.studentName,
                regNo: app.regNo,
                gender: app.gender,
                hostelName: bestRoom.hostelName,
                roomNumber: bestRoom.roomNumber,
                floor: bestRoom.floor,
                bedCode: bedA,
                seater: bestRoom.seater,
                isAc: bestRoom.isAc,
                isApartment: bestRoom.isApartment,
                hasLaundry: bestRoom.hasLaundry,
                hasGymAccess: bestRoom.hasGymAccess,
                allocationMode: 'friend',
                assignedRoommates: [{
                  name: friendApp.studentName,
                  regNo: friendApp.regNo,
                  program: friendApp.program,
                  matchScore: compScore,
                  isFriendMatched: true
                }],
                matchScore: compScore,
                matchExplanation: `Verified Mutual Friend Allocation with ${friendApp.studentName} (Reg: ${friendApp.regNo}). Compatibility Score: ${compScore}%.`,
                isDraft: true,
                wardenApproved: false,
                isPublished: false,
                allocatedAt: now,
                friendLinkedRegNo: friendApp.regNo
              });

              allocations.push({
                id: `alloc-${friendApp.regNo}`,
                studentId: friendApp.studentId,
                studentName: friendApp.studentName,
                regNo: friendApp.regNo,
                gender: friendApp.gender,
                hostelName: bestRoom.hostelName,
                roomNumber: bestRoom.roomNumber,
                floor: bestRoom.floor,
                bedCode: bedB,
                seater: bestRoom.seater,
                isAc: bestRoom.isAc,
                isApartment: bestRoom.isApartment,
                hasLaundry: bestRoom.hasLaundry,
                hasGymAccess: bestRoom.hasGymAccess,
                allocationMode: 'friend',
                assignedRoommates: [{
                  name: app.studentName,
                  regNo: app.regNo,
                  program: app.program,
                  matchScore: compScore,
                  isFriendMatched: true
                }],
                matchScore: compScore,
                matchExplanation: `Verified Mutual Friend Allocation with ${app.studentName} (Reg: ${app.regNo}). Compatibility Score: ${compScore}%.`,
                isDraft: true,
                wardenApproved: false,
                isPublished: false,
                allocatedAt: now,
                friendLinkedRegNo: app.regNo
              });

              allocatedStudentIds.add(app.studentId);
              allocatedStudentIds.add(friendApp.studentId);
              processedFriendPairs.add(pairKey);
              friendPairsAllocated += 1;
              firstChoiceMatches += 2;
            }
          }
        }
      }
    }
  }

  // =========================================================================
  // PHASE 2: PROCESS MANUAL SELECTION & RANDOM ALLOCATIONS
  // =========================================================================
  for (const app of sortedApps) {
    if (allocatedStudentIds.has(app.studentId)) continue;

    let allocated = false;
    const allowedHostelIds = hostels
      .filter((h) => h.gender === app.gender || h.gender === 'Any')
      .map((h) => h.id);

    // If student chose Manual Room Selection
    if (app.allocationMode === 'manual' && app.preferences.length > 0 && app.preferences[0].roomNumber) {
      const pref = app.preferences[0];
      const targetRoom = bedTracker.find(r => 
        allowedHostelIds.includes(r.hostelId) &&
        r.roomNumber === pref.roomNumber &&
        r.availableSlots > 0 &&
        (!pref.hostelId || r.hostelId === pref.hostelId)
      );

      if (targetRoom) {
        targetRoom.availableSlots -= 1;
        targetRoom.occupants.push({ student: app });
        const bedNumber = targetRoom.seater - targetRoom.availableSlots;
        const bedCode = `${targetRoom.hostelName.split(' ')[0]}-${targetRoom.roomNumber}-B${bedNumber}`;

        const roommates = targetRoom.occupants
          .filter(o => o.student.id !== app.id)
          .map(o => ({
            name: o.student.studentName,
            regNo: o.student.regNo,
            program: o.student.program,
            matchScore: calculateLifestyleCompatibility(app.lifestyle, o.student.lifestyle)
          }));

        const compScore = roommates.length > 0 ? roommates[0].matchScore : 95;

        allocations.push({
          id: `alloc-${app.regNo}`,
          studentId: app.studentId,
          studentName: app.studentName,
          regNo: app.regNo,
          gender: app.gender,
          hostelName: targetRoom.hostelName,
          roomNumber: targetRoom.roomNumber,
          floor: targetRoom.floor,
          bedCode,
          seater: targetRoom.seater,
          isAc: targetRoom.isAc,
          isApartment: targetRoom.isApartment,
          hasLaundry: targetRoom.hasLaundry,
          hasGymAccess: targetRoom.hasGymAccess,
          allocationMode: 'manual',
          assignedRoommates: roommates,
          matchScore: compScore,
          matchExplanation: `Manual Room Selection: Successfully assigned to chosen Room ${targetRoom.roomNumber} (Floor ${targetRoom.floor}, ${targetRoom.hostelName}).`,
          isDraft: true,
          wardenApproved: false,
          isPublished: false,
          allocatedAt: new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })
        });

        allocatedStudentIds.add(app.studentId);
        allocated = true;
        firstChoiceMatches += 1;
      }
    }

    // If Manual selection couldn't be fulfilled or student chose Random Allocation
    if (!allocated) {
      // Find candidate rooms matching Hard Constraints
      const candidateRooms = bedTracker.filter((r) => {
        if (!allowedHostelIds.includes(r.hostelId)) return false;
        if (r.availableSlots <= 0) return false;

        // Preferred occupancy check (1, 2, or 3-seater)
        if (app.preferredOccupancy && r.seater !== app.preferredOccupancy) return false;

        // Apartment preference check
        if (app.apartmentPreference === 'with_apartment' && !r.isApartment) return false;

        // Medical floor priority
        if (app.medicalAccessibilityNeeded && r.floor > 1 && !r.isAccessible) return false;

        return true;
      });

      // Fallback: If no room matches strict apartment/occupancy preference, relax soft constraint
      const pool = candidateRooms.length > 0 ? candidateRooms : bedTracker.filter(r => 
        allowedHostelIds.includes(r.hostelId) && 
        r.availableSlots > 0 &&
        (!app.medicalAccessibilityNeeded || r.floor === 1 || r.isAccessible)
      );

      if (pool.length > 0) {
        // Soft Constraint: Find room with highest lifestyle compatibility
        let bestRoom = pool[0];
        let bestCompatibility = 75;

        for (const candidate of pool) {
          if (candidate.occupants.length > 0) {
            const avgComp = candidate.occupants.reduce(
              (sum, occ) => sum + calculateLifestyleCompatibility(app.lifestyle, occ.student.lifestyle),
              0
            ) / candidate.occupants.length;

            if (avgComp > bestCompatibility) {
              bestCompatibility = Math.round(avgComp);
              bestRoom = candidate;
            }
          }
        }

        bestRoom.availableSlots -= 1;
        bestRoom.occupants.push({ student: app });
        const bedNumber = bestRoom.seater - bestRoom.availableSlots;
        const bedCode = `${bestRoom.hostelName.split(' ')[0]}-${bestRoom.roomNumber}-B${bedNumber}`;

        const roommates = bestRoom.occupants
          .filter(o => o.student.id !== app.id)
          .map(o => ({
            name: o.student.studentName,
            regNo: o.student.regNo,
            program: o.student.program,
            matchScore: calculateLifestyleCompatibility(app.lifestyle, o.student.lifestyle)
          }));

        allocations.push({
          id: `alloc-${app.regNo}`,
          studentId: app.studentId,
          studentName: app.studentName,
          regNo: app.regNo,
          gender: app.gender,
          hostelName: bestRoom.hostelName,
          roomNumber: bestRoom.roomNumber,
          floor: bestRoom.floor,
          bedCode,
          seater: bestRoom.seater,
          isAc: bestRoom.isAc,
          isApartment: bestRoom.isApartment,
          hasLaundry: bestRoom.hasLaundry,
          hasGymAccess: bestRoom.hasGymAccess,
          allocationMode: 'random',
          assignedRoommates: roommates,
          matchScore: bestCompatibility,
          matchExplanation: `Random Allocation Engine: Optimized match (${bestRoom.seater}-Seater ${bestRoom.isAc ? 'AC' : 'Non-AC'}, Floor ${bestRoom.floor}). Lifestyle Harmony: ${bestCompatibility}%.`,
          isDraft: true,
          wardenApproved: false,
          isPublished: false,
          allocatedAt: new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })
        });

        allocatedStudentIds.add(app.studentId);
        allocated = true;
        firstChoiceMatches += 1;
      }
    }

    // If still not allocated, student is added to the Waiting List
    if (!allocated) {
      waitlist.push({
        studentId: app.studentId,
        studentName: app.studentName,
        regNo: app.regNo,
        rank: waitlist.length + 1,
        reason: 'Selected room occupancy or hostel block reached capacity in current cycle.'
      });
    }
  }

  const satisfactionRate =
    allocations.length > 0
      ? Math.round((firstChoiceMatches / allocations.length) * 100)
      : 100;

  return {
    totalProcessed: eligibleApps.length,
    allocatedCount: allocations.length,
    waitlistedCount: waitlist.length,
    allocations,
    waitlist,
    satisfactionRate,
    friendPairsAllocated
  };
}
