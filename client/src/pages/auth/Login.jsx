import * as yup from 'yup'
import { useState } from 'react'
import {avatars} from '../../utils/avatar'
import countries from '../../utils/countries'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/useUserStore'
import useLoginStore from '../../store/useLoginStore'
import useThemeStore from '../../store/useThemeStore'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

const loginValidationShema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, 'Phone Number must be a digit')
      .transform((value, originalValue) =>
        originalValue.trim() === '' ? null : value
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email('Please Enter Valid Email')
      .transform((value, originalValue) =>
        originalValue.trim() === '' ? null : value
      ),
  })
  .test(
    'at-least-one',
    'Either email or phone number is required',
    function (value) {
      return !!(value.phoneNumber || value.email)
    }
  )

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, 'Otp must be exactly 6 digit')
    .required('Otp is required'),
})

const profileValidationSchema = yup.object().shape({
  username: yup.string().required('username is required'),
  agreed: yup.bool().oneOf([true], 'you must be agreed to the terms'),
})

const Login = () => {
  const {
    step,
    setStep,
    setUserPhoneData,
    userPhoneData,
    resetLoginState,
  } = useLoginStore()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  // avatar not yet included
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setUser } = useUserStore()
  const { theme, setTheme } = useThemeStore()

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationShema),
  })

  const {
    setValue: setOtpValue,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  })

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  })

  return (
    <div
      className={`min-h-screen ${theme == 'dark' ? 'bg-gray-900' : 'bg-linear-to-br from-green-400 to-blue-500'} flex items-center justify-center p-4 overflow-hidden`}
    ></div>
  )
}

export default Login
