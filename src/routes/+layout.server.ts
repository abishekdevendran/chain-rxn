import { nanoid } from 'nanoid';

export const load = async ({ cookies }) => {
	// check if uname cookie exists
	const uname = cookies.get('uname');
	const uid = cookies.get('uid');
	// if uid is not set, set a new uid
	if (!uid) {
		cookies.set('uid', nanoid(), {
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
	}
	return {
		uname,
		uid
	};
};
