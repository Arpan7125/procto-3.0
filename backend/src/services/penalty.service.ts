import { PrismaClient, EventSeverity, SessionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class PenaltyEngine {
  /**
   * Processes a new suspicious event, updates trust score, and checks for auto-termination.
   */
  static async processEvent(sessionId: string) {
    // 1. Fetch the session, the related exam, and its rules
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          include: { examRules: true },
        },
        suspiciousEvents: true,
      },
    });

    if (!session || !session.exam.examRules) {
      console.warn(`PenaltyEngine: No rules or session found for sessionId \${sessionId}`);
      return;
    }

    const rules = session.exam.examRules;
    const events = session.suspiciousEvents;

    // 2. Count severity instances
    const lowCount = events.filter((e) => e.severity === EventSeverity.LOW).length;
    const mediumCount = events.filter((e) => e.severity === EventSeverity.MEDIUM).length;
    const highCount = events.filter((e) => e.severity === EventSeverity.HIGH).length;

    // 3. Calculate Trust Score
    // Base is 100. Let's say LOW = -2.5, MEDIUM = -10, HIGH = -25 per event.
    // Minimum score is 0.
    const penaltyAmount = (lowCount * 2.5) + (mediumCount * 10) + (highCount * 25);
    const calculatedScore = Math.max(100 - penaltyAmount, 0);

    // 4. Check auto-termination conditions
    let shouldTerminate = false;
    let terminationReason = '';

    if (rules.autoTerminate) {
      if (lowCount >= rules.maxLowSeverityEvents) {
        shouldTerminate = true;
        terminationReason = `Exceeded max LOW severity events (\${rules.maxLowSeverityEvents})`;
      } else if (mediumCount >= rules.maxMediumSeverityEvents) {
        shouldTerminate = true;
        terminationReason = `Exceeded max MEDIUM severity events (\${rules.maxMediumSeverityEvents})`;
      } else if (highCount >= rules.maxHighSeverityEvents) {
        shouldTerminate = true;
        terminationReason = `Exceeded max HIGH severity events (\${rules.maxHighSeverityEvents})`;
      } else if (calculatedScore < 20) {
        // Hard threshold: if trust score falls below 20%, terminate.
        shouldTerminate = true;
        terminationReason = 'Trust score fell below critical threshold (20%)';
      }
    }

    // 5. Update session in database
    let updateData: any = {
      trustScore: calculatedScore,
    };

    if (shouldTerminate && session.status !== SessionStatus.TERMINATED) {
      updateData.status = SessionStatus.TERMINATED;
      updateData.submittedAt = new Date();
      // Optionally we could create an AuditLog here indicating the auto-termination reason.
      await prisma.auditLog.create({
        data: {
          userId: session.studentId, // system action but targets the student
          action: 'AUTO_TERMINATE_EXAM_SESSION',
          resourceType: 'ExamSession',
          resourceId: session.id,
          // Storing termination reason in some description form - IP maybe empty
        }
      });
      console.log(`PenaltyEngine: Session \${sessionId} auto-terminated. Reason: \${terminationReason}`);
    }

    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return {
      updatedSession,
      shouldTerminate,
      terminationReason,
      trustScore: calculatedScore
    };
  }
}
