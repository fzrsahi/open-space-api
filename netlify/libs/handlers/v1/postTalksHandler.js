const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');
const { createRepository } = require('../../repositories/supabase');
const createTalkUseCase = require('../../usecase/createTalkUseCase');
const { response } = require('../../utils/functions');

function validatePostTalkPayload(payload) {
  const scheme = Joi.object({
    text: Joi.string().required(),
    replyTo: Joi.string().allow('').optional(),
  });

  const { error, value } = scheme.validate(payload);

  if (error) {
    throw new InvariantError(error.message);
  }

  return value;
}

async function postTalksHandler(request, _, { id }) {
  const { body } = request;
  const repository = createRepository();

  try {
    const { text, replyTo } = validatePostTalkPayload(JSON.parse(body));

    const talk = await createTalkUseCase({ text, replyTo, user: id }, { repository });

    return response({
      statusCode: 201,
      message: 'Talk created',
      data: {
        talk,
      },
    });
  } catch (error) {
    if (error instanceof InvariantError) {
      return response({
        statusCode: 400,
        message: error.message,
      });
    }

    console.error(error);

    return response({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
}

module.exports = postTalksHandler;
