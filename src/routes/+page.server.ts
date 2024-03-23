import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	name: async ({ request, cookies }) => {
		const formData = await request.formData();
		const uname = formData.get('uname') as string;
		if (!uname) {
			return fail(400, {
				error: 'Not a valid username'
			});
		}
		// if(uname!=='admin'){
		// 	return fail(400, {
		// 		error: 'Not a valid username'
		// 	});
		// }
		cookies.set('uname', uname, {
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
		// touch the uid cookie
		cookies.set('uid', cookies.get('uid')!, {
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
		return {
			success: true
		};
	},
	join: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		return redirect(302, `/${id}`);
	}
};
