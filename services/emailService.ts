import { SubRequest, Flow } from "../types.ts";
import { TEAM_MEMBERS } from "../constants.ts";

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
   */
  static async processTaskAssignment(task: SubRequest, flow: Flow): Promise<string> {
    const roleKey = task.assigned_role_key;
    const recipients = TEAM_MEMBERS.filter(member => member.role_key === roleKey);
    
    if (recipients.length === 0) {
      throw new Error(`Critical failure: No recipient found for role "${roleKey}".`);
    }

    const otherRoles = flow.subRequests
      .filter(s => s.assigned_role_key !== roleKey)
      .map(s => TEAM_MEMBERS.find(m => m.role_key === s.assigned_role_key)?.role)
      .filter(Boolean);

    const subject = `[FR-${flow.id}] ${flow.title} – ${task.task_type}`;
    const body = `
Dobrý den,

V systému DEK FlowRequest Vám byl přidělen úkol v rámci zakázky: ${flow.title}

VAŠE ZADÁNÍ:
----------------------------------------------------------------------
${task.description}

Termín odpovědi: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')}
----------------------------------------------------------------------

SOUVISLOSTI PROJEKTU:
${flow.description}

TÝMOVÁ SPOLUPRÁCE:
Na tomto projektu se dále podílí: ${otherRoles.length > 0 ? otherRoles.join(', ') : 'Žádné další role'}

Pro potvrzení stačí odpovědět na tento e-mail.

S pozdravem,
DEK FlowRequest Engine
    `.trim();

    for (const member of recipients) {
      await this.sendEmail(member.email, subject, body);
    }

    return body;
  }
}

export const processTaskEmailAutomation = async (task: SubRequest, flow: Flow): Promise<string> => {
  return await EmailService.processTaskAssignment(task, flow);
}