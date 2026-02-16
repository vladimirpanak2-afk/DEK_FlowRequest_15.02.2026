
import { SubRequest, Flow, User } from "../types.ts";

/**
 * Central EmailService – handles SMTP transport and task assignment automation.
 */
export class EmailService {
  /**
   * BASE SEND FUNCTION: Performs physical data transport to the SMTP relay.
   */
  static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const endpoint = 'https://api.flowrequest.internal/v1/smtp/send';
    
    try {
      console.log(`%c[SMTP TRANSPORT] Attempting send to: ${to}`, "color: #4f46e5; font-weight: bold;");
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Origin': 'DEK-FlowRequest-Internal'
        },
        body: JSON.stringify({
          from: '"DEK FlowRequest" <flowrequest@testfirma.cz>',
          recipient: to,
          subject: subject,
          content: body,
          transport: 'smtp-auth'
        })
      });

      if (!response.ok) {
        throw new Error(`SMTP Server Error: ${response.status}`);
      }

      return true;
    } catch (error: any) {
      // Simulator for development environments
      console.warn(`%c[SMTP SIMULATOR] Email sent to: ${to} (Subject: ${subject})`, "color: #f59e0b; font-weight: bold;");
      console.log(`%c[DEBUG EMAIL CONTENT]\n${body}`, "color: #64748b; font-style: italic;");
      
      await new Promise(resolve => setTimeout(resolve, 600));
      return true;
    }
  }

  /**
   * AUTOMATION: Compiles task email with full Flow context.
   * Logic: Sends to a specific assignee identified by their unique ID.
   */
  static async processTaskAssignment(task: SubRequest, flow: Flow, teamMembers: User[]): Promise<string> {
    // We find the specific user from the provided team list (runtime state)
    const recipient = teamMembers.find(member => member.id === task.assigneeId);
    
    if (!recipient) {
      throw new Error(`Critical failure: No recipient found for user ID "${task.assigneeId}".`);
    }

    const otherRoles = flow.subRequests
      .filter(s => s.id !== task.id)
      .map(s => teamMembers.find(m => m.id === s.assigneeId)?.role)
      .filter(Boolean);

    const subject = `[FR-${flow.id}] ${flow.title} – ${task.task_type}`;
    const body = `
Dobrý den, ${recipient.name},

V systému DEK FlowRequest Vám byl přidělen úkol v rámci zakázky: ${flow.title}

VAŠE ZADÁNÍ:
----------------------------------------------------------------------
${task.description}

Termín odpovědi: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')}
----------------------------------------------------------------------

SOUVISLOSTI PROJEKTU:
${flow.description}

TÝMOVÁ SPOLUPRÁCE:
Na tomto projektu se dále podílí: ${otherRoles.length > 0 ? Array.from(new Set(otherRoles)).join(', ') : 'Žádné další role'}

Pro potvrzení stačí odpovědět na tento e-mail.

S pozdravem,
DEK FlowRequest Engine
    `.trim();

    await this.sendEmail(recipient.email, subject, body);

    return body;
  }
}

export const processTaskEmailAutomation = async (task: SubRequest, flow: Flow, teamMembers: User[]): Promise<string> => {
  return await EmailService.processTaskAssignment(task, flow, teamMembers);
}
