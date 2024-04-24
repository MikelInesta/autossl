import { Schema, model, Types } from 'mongoose';

interface IAgent {
	_id: Types.ObjectId;
}

const schema = new Schema<IAgent>();

const Agent = model<IAgent>('Agent', schema);

export { Agent, IAgent };
