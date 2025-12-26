import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync(userId: string) {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;

        // Save token to database
        if (token && userId) {
            // We are saving it for the parent in the 'users' table? Or just locally?
            // The prompt says "Push notifications when child connects or completes battle".
            // This implies the PARENT receives notifications.
            // So we should save this token to the `children` table for the child? No, the parent's device token needed.
            // But the schema only has `device_token` on the `children` table. 
            // We might need to add it to `users` or a separate table.
            // For MVP, we'll follow the schema given, which implies children get notifications?
            // Wait, "Push notifications when child connects or completes battle" -> sent TO Parent.
            // The schema `users` table doesn't have a `device_token` column.
            // I should probably add one to `users` or just store it in a profile table.
            // For now, I will skip saving to DB until schema supports it, effectively logging it.
            console.log('Push Token:', token);

            // MVP Hack: Store in user metadata or separate call if needed. 
            // Or update schema in next step.
        }

    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
