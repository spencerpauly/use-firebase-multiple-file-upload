/*eslint-disable */
import { IonRow, IonCol, IonIcon } from '@ionic/react';
/*eslint-enable */

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import IonGridNoPadding from '../utilities/IonGridNoPadding';
import { cloudUploadOutline } from 'ionicons/icons';
import { useUploadFiles } from '../hooks/useUploadFiles';
import { animated, useSprings } from 'react-spring';

interface Props {}

const AttachFiles: React.FC<Props> = () => {
	const [state, uploadFiles] = useUploadFiles('test');
	const inputRef = useRef<any>();

	useEffect(() => {
		console.log(state);
	}, [state]);

	const springs = useSprings(
		state.length,
		state.map((file) => ({
			height: file.loadingPercent ? `${file.loadingPercent}%` : '0%',
		}))
	);

	return (
		<IonGridNoPadding>
			<IonRow>
				{state.map((file, index) => (
					<IonCol size='auto'>
						<ImageContainer incomplete={!file.downloadURL}>
							<Overlay style={springs[index]} />

							<PreviewImage src={file.localFileId} />
						</ImageContainer>
					</IonCol>
				))}

				<IonCol size='auto'>
					<InputArea onClick={() => inputRef?.current?.click()}>
						<IonIcon icon={cloudUploadOutline} />
					</InputArea>
					<input
						ref={inputRef}
						onChange={() => uploadFiles(inputRef?.current?.files)}
						type='file'
						name='images'
						accept='image/*'
						multiple
						hidden
					/>
				</IonCol>
			</IonRow>
		</IonGridNoPadding>
	);
};

export default AttachFiles;

const Overlay = styled(animated.div)`
	background: rgba(5, 146, 255, 0.3);
	width: 100%;
	z-index: 2;
	position: absolute;
	bottom: 0;
`;

const ImageContainer = styled.div<{ incomplete: boolean }>`
	position: relative;
	margin: auto;
	width: 6rem;
	height: 6rem;
	object-fit: contain;
	border: ${(props) => (props.incomplete ? 'none' : '2px solid var(--ion-color-success)')};
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--ion-color-light);
`;

const PreviewImage = styled.img`
	max-width: 5.5rem;
	max-height: 5.5rem;
	object-fit: contain;
`;

const InputArea = styled.button`
	position: relative;
	margin: auto;
	width: 6rem;
	height: 6rem;
	background: none;
	border: 1.5px dashed var(--ion-color-medium);
	display: flex;
	justify-content: center;
	align-items: center;
`;
