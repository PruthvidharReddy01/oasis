import React, { useState } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { IRoomData } from '../../../types/Rooms'
import { useAppSelector } from '../hooks'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const CreateRoomFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  width: 320px;
  gap: 20px;
`

export const CreateRoomForm = () => {
  const [values, setValues] = useState<IRoomData>({
    name: '',
    description: '',
    password: null,
    autoDispose: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [nameFieldEmpty, setNameFieldEmpty] = useState(false)
  const [descriptionFieldEmpty, setDescriptionFieldEmpty] = useState(false)
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)

  const handleChange = (prop: keyof IRoomData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValidName = values.name !== ''
    const isValidDescription = values.description !== ''

    if (isValidName === nameFieldEmpty) setNameFieldEmpty(!nameFieldEmpty)
    if (isValidDescription === descriptionFieldEmpty)
      setDescriptionFieldEmpty(!descriptionFieldEmpty)

    // create custom room if name and description are not empty
    if (isValidName && isValidDescription && lobbyJoined) {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.network
        .createCustom(values)
        .then(() => bootstrap.launchGame())
        .catch((error) => console.error(error))
    }
  }

  return (
    <CreateRoomFormWrapper onSubmit={handleSubmit}>
      <TextField
        label="Name"
        variant="outlined"
        autoFocus
        error={nameFieldEmpty}
        helperText={nameFieldEmpty && 'Name is required'}
        onChange={handleChange('name')}
        sx={{
          '& .MuiInputBase-input': {
            color: 'black', 
          },
          '& .MuiInputBase-inputMultiline': {
            color: 'black', 
          },
          '& .MuiFormLabel-root': {
            color: 'black', 
          },
          '& .MuiFormHelperText-root': {
            color: 'black', 
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'primary.main', // Border color
            },
            '&:hover fieldset': {
              borderColor: 'primary.dark', // Border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main', // Border color when focused
            },
          },
        }}
      />

      <TextField
        label="Description"
        variant="outlined"
        error={descriptionFieldEmpty}
        helperText={descriptionFieldEmpty && 'Description is required'}
        multiline
        rows={4}
        onChange={handleChange('description')}
        sx={{
          '& .MuiInputBase-input': {
            color: 'black', 
          },
          '& .MuiInputBase-inputMultiline': {
            color: 'black', 
          },
          '& .MuiFormLabel-root': {
            color: 'black', 
          },
          '& .MuiFormHelperText-root': {
            color: 'black', 
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'primary.main', // Border color
            },
            '&:hover fieldset': {
              borderColor: 'primary.dark', // Border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main', // Border color when focused
            },
          },
        }}
      />

      <TextField
        type={showPassword ? 'text' : 'password'}
        label="Password (optional)"
        onChange={handleChange('password')}
        color="secondary"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-input': {
            color: 'black', // Text color
          },
          '& .MuiInputBase-inputMultiline': {
            color: 'black', // Text color for multiline
          },
          '& .MuiFormLabel-root': {
            color: 'black', // Label color when not focused
          },
          '& .MuiFormLabel-root.Mui-focused': {
            color: 'black', // Label color when focused
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'primary.main', // Border color
            },
            '&:hover fieldset': {
              borderColor: 'primary.dark', // Border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main', // Border color when focused
            },
          },
        }}
      />
      <Button variant="contained" color="primary" type="submit">
        Create
      </Button>
    </CreateRoomFormWrapper>
  )
}
