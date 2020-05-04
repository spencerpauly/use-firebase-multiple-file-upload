import firebase from '../firebase';
import { createId } from '../controller/FirebaseController';
import { useCallback } from 'react';
import { useImmerReducer } from 'use-immer';

type StateType = {
	localFileId: string;
	downloadURL: string | undefined;
	loadingPercent: number | undefined;
	error: string | undefined;
};

const initialState: StateType[] = [];

function getIndex(arr: StateType[], id: string) {
	return arr.findIndex((x) => x.localFileId === id);
}

function storageReducer(draft: StateType[], action: any) {
	switch (action.type) {
		case SUBMITTING: {
			draft.push({
				localFileId: action.localFileId,
				downloadURL: undefined,
				loadingPercent: undefined,
				error: undefined,
			});
			return;
		}

		case UPDATE_LOADING: {
			draft[getIndex(draft, action.id)].loadingPercent = action.percent;
			return;
		}

		case SUCCESS: {
			draft[getIndex(draft, action.id)].downloadURL = action.downloadURL;
			draft[getIndex(draft, action.id)].loadingPercent = undefined;
			draft[getIndex(draft, action.id)].error = undefined;
			return;
		}

		case ERROR: {
			draft[getIndex(draft, action.id)].loadingPercent = undefined;
			draft[getIndex(draft, action.id)].error = action.error;
			return;
		}

		case RESET: {
			draft = initialState;
			return;
		}

		default:
			return;
	}
}

export const SUBMITTING = `SUBMITTING`;
export const UPDATE_LOADING = `UPDATE_LOADING`;
export const SUCCESS = `SUCCESS`;
export const ERROR = `ERROR`;
export const RESET = `RESET`;

//ACTION CREATORS
export const submitting = (localFileId: string) => ({ type: SUBMITTING, localFileId });
export const updateLoading = (percent: number, id: string) => ({
	type: UPDATE_LOADING,
	percent,
	id,
});
export const success = (downloadURL: string, id: string) => ({
	type: SUCCESS,
	downloadURL,
	id,
});
export const error = (error: string, id: string) => ({ type: ERROR, error, id });
export const reset = () => ({ type: RESET });

export const useUploadFiles = (uploadPath: string) => {
	const [state, dispatch] = useImmerReducer(storageReducer, initialState);

	const uploadFiles = useCallback(
		async (fileList?: FileList) => {
			if (!fileList) {
				return;
			}

			const promises: firebase.storage.UploadTask[] = [];

			for (let i = 0; i < fileList.length; i++) {
				const newFile: File = fileList[i];
				const localFileId = URL.createObjectURL(newFile);
				const fileId = createId();
				const uploadTask = firebase.storage().ref().child(uploadPath).child(fileId).put(newFile);

				dispatch(submitting(localFileId));

				promises.push(uploadTask);

				uploadTask.on(
					firebase.storage.TaskEvent.STATE_CHANGED,
					(snapshot) => {
						const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						if (snapshot.state === firebase.storage.TaskState.RUNNING) {
							dispatch(updateLoading(progress, localFileId));
						}
					},
					(err) => {
						dispatch(error(err.message, localFileId));
					},
					async () => {
						const downloadURL = (await uploadTask.snapshot.ref.getDownloadURL()) as string;
						dispatch(success(downloadURL, localFileId));
					}
				);
			}

			return Promise.all(promises)
				.then((a) => console.log('All files uploaded'))
				.catch((err) => console.log(err));
		},
		[uploadPath, dispatch]
	);

	return [state, uploadFiles] as const;
};
