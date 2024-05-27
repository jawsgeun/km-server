import { API_URL } from '@/src/utils/api_util';

export interface EyeMeasurementBody {
  volume: number;
  rawMenuItemId: number;
  rawFoodIngredientId: number;
}

const APIPostEyeMeasurement = async (input: EyeMeasurementBody) => {
  const res = await fetch(`${API_URL}/eye-measurement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      volume: Number(input.volume),
      rawMenuItemId: Number(input.rawMenuItemId),
      rawFoodIngredientId: Number(input.rawFoodIngredientId),
    }),
  });
  const result = await res.json();
  return result;
};

export async function POST(request: Request) {
  const body = (await request.json()) as EyeMeasurementBody;

  const result = await APIPostEyeMeasurement(body);

  return Response.json(result);
}
