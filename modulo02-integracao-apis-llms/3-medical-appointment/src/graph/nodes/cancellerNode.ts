import { z } from 'zod/v3';
import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';

const CancelRequiredFieldsSchema = z.object({
  professionalId: z.number(),
  patientName: z.string(),
  datetime: z.string(),
});

export function createCancellerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`❌ Cancelling appointment...`);

    try {
      const validation = CancelRequiredFieldsSchema.safeParse(state);

      if (validation.error) {
        const errorMessages = validation.error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join('; ');
        return {
          actionSuccess: false,
          actionError: errorMessages
        }
      }
      
      appointmentService.cancelAppointment(
        validation.data.professionalId,
        validation.data.patientName,
        new Date(validation.data.datetime),
      )

      return {
        ...state,
        actionSuccess: true,
      };
    } catch (error) {
      console.log(`❌ Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  };
}
