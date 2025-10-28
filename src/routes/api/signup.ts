import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/utils/auth'
import { db } from '@/db'
import { userTeamData } from '@/db/schema'
import { validateFplData } from '@/utils/fpl-validation'
import type { SignUpPayload, SignUpResponse } from '@/types/signup'

export const Route = createFileRoute('/api/signup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body: SignUpPayload = await request.json()
          
          // Validate required fields
          if (!body.name || !body.email || !body.password || !body.fplTeamId || !body.fplLeagueId || !body.favoriteTeam) {
            return Response.json({
              success: false,
              message: 'All fields are required',
              errors: {
                general: 'Please fill in all required fields'
              }
            } as SignUpResponse, { status: 400 })
          }

          // Validate FPL data
          const fplValidation = await validateFplData(body.fplTeamId, body.fplLeagueId)
          
          if (!fplValidation.allValid) {
            return Response.json({
              success: false,
              message: 'FPL validation failed',
              errors: {
                fplTeamId: fplValidation.teamResult.error,
                fplLeagueId: fplValidation.leagueResult.error
              }
            } as SignUpResponse, { status: 400 })
          }

          // Create user with Better Auth
          const authResponse = await auth.api.signUpEmail({
            body: {
              name: body.name,
              email: body.email,
              password: body.password
            }
          })

          if (!authResponse || !authResponse.user) {
            return Response.json({
              success: false,
              message: 'Failed to create user account',
              errors: {
                general: 'Unable to create account. Please try again.'
              }
            } as SignUpResponse, { status: 500 })
          }

          // Insert FPL data into user_team_data table
          try {
            await db.insert(userTeamData).values({
              userId: authResponse.user.id,
              fplTeamId: body.fplTeamId,
              fplLeagueId: body.fplLeagueId,
              favoriteTeam: body.favoriteTeam
            })
          } catch (dbError) {
            console.error('Database error inserting user team data:', dbError)
            // Note: User is already created in Better Auth, but FPL data failed
            // In a production app, you might want to rollback the user creation
            return Response.json({
              success: false,
              message: 'Account created but failed to save FPL data',
              errors: {
                general: 'Please contact support to complete your setup.'
              }
            } as SignUpResponse, { status: 500 })
          }

          return Response.json({
            success: true,
            message: 'Account created successfully!',
            user: {
              id: authResponse.user.id,
              name: authResponse.user.name,
              email: authResponse.user.email
            }
          } as SignUpResponse)

        } catch (error) {
          console.error('Signup error:', error)
          
          // Handle Better Auth specific errors
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = error.message as string
            
            if (errorMessage.includes('email') && errorMessage.includes('already')) {
              return Response.json({
                success: false,
                message: 'An account with this email already exists',
                errors: {
                  general: 'Please sign in instead or use a different email address.'
                }
              } as SignUpResponse, { status: 409 })
            }
            
            if (errorMessage.includes('password')) {
              return Response.json({
                success: false,
                message: 'Password validation failed',
                errors: {
                  general: 'Password must be at least 8 characters long.'
                }
              } as SignUpResponse, { status: 400 })
            }
          }

          return Response.json({
            success: false,
            message: 'An unexpected error occurred',
            errors: {
              general: 'Please try again later or contact support if the problem persists.'
            }
          } as SignUpResponse, { status: 500 })
        }
      }
    }
  }
})
