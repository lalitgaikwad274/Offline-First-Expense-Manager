import React, { memo, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronDown, Landmark } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { moderateScale } from '../utils/responsive';
import { SPACING } from '../utils/spacing';

export interface Bank {
    id: string;
    name: string;
    icon: string;
}

interface BankDropdownProps {
    banks: Bank[];
    value?: Bank | null;
    placeholder?: string;
    onChange: (bank: Bank) => void;
    disabled?: boolean;
}

const svgCache = new Map<string, string>();

const BankIcon = ({ uri, size = 34 }: { uri?: string; size?: number }) => {
    const cleanUri = uri?.trim();
    const [svgXml, setSvgXml] = useState<string | null>(() => {
        if (cleanUri && svgCache.has(cleanUri)) {
            return svgCache.get(cleanUri)!;
        }
        return null;
    });
    const [isFailed, setIsFailed] = useState(false);

    useEffect(() => {
        if (!cleanUri || !cleanUri.endsWith('.svg')) {
            return;
        }

        if (svgCache.has(cleanUri)) {
            setSvgXml(svgCache.get(cleanUri)!);
            return;
        }

        let isMounted = true;
        fetch(cleanUri)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then(text => {
                if (!isMounted) return;
                if (!text || !text.includes('<svg')) {
                    throw new Error('Invalid SVG content');
                }
                // Strip CSS display-p3 color syntax which renders transparent in react-native-svg
                const cleaned = text
                    .replace(/;\s*fill\s*:\s*color\([^)]+\)/gi, '')
                    .replace(/fill\s*:\s*color\([^)]+\);?/gi, '')
                    .replace(/color\(display-p3[^)]+\)/gi, '');

                svgCache.set(cleanUri, cleaned);
                setSvgXml(cleaned);
            })
            .catch(() => {
                if (isMounted) {
                    setIsFailed(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [cleanUri]);

    const renderDefaultIcon = () => (
        <View
            style={[
                styles.defaultIconContainer,
                { width: size, height: size, borderRadius: size / 2, marginRight: 12 },
            ]}
        >
            <Landmark size={Math.round(size * 0.58)} color="#3478E5" strokeWidth={2} />
        </View>
    );

    if (!cleanUri || isFailed) {
        return renderDefaultIcon();
    }

    if (cleanUri.endsWith('.svg')) {
        if (!svgXml) {
            return renderDefaultIcon();
        }

        return (
            <View
                style={{
                    width: size,
                    height: size,
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <SvgXml
                    xml={svgXml}
                    width={size}
                    height={size}
                    onError={() => setIsFailed(true)}
                    fallback={renderDefaultIcon()}
                />
            </View>
        );
    }

    return (
        <Image
            source={{ uri: cleanUri }}
            style={{ width: size, height: size, marginRight: 12 }}
            resizeMode="contain"
            onError={() => setIsFailed(true)}
        />
    );
};

const BankDropdown = memo(({
    banks,
    value,
    placeholder = 'Select Bank',
    onChange,
    disabled = false,
}: BankDropdownProps) => {
    console.log("@23 banks : ", JSON.stringify(banks))
    const [isOpen, setIsOpen] = useState(false);

    const selectedBank = useMemo(
        () => value || null,
        [value],
    );

    const handleSelect = (bank: Bank) => {
        onChange(bank);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Selected Bank Card */}
            <Pressable
                disabled={disabled}
                onPress={() => setIsOpen(prev => !prev)}
                style={({ pressed }) => [
                    styles.selector,
                    pressed && styles.pressed,
                    disabled && styles.disabled,
                ]}
            >
                {selectedBank ? (
                    <>
                        <BankIcon uri={selectedBank.icon} size={36} />

                        <Text
                            style={styles.selectedText}
                            numberOfLines={1}
                        >
                            {selectedBank.name}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.placeholder}>
                        {placeholder}
                    </Text>
                )}

                <ChevronDown
                    size={22}
                    color="#0B2345"
                    strokeWidth={2.2}
                    style={[
                        styles.chevron,
                        isOpen && styles.chevronOpen,
                    ]}
                />
            </Pressable>

            {/* Dropdown */}
            {isOpen && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={banks}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        renderItem={({ item }) => {
                            const isSelected = selectedBank?.id === item.id;

                            return (
                                <Pressable
                                    onPress={() => handleSelect(item)}
                                    style={({ pressed }) => [
                                        styles.bankItem,
                                        pressed && styles.itemPressed,
                                        isSelected && styles.selectedItem,
                                    ]}
                                >
                                    <BankIcon uri={item.icon} size={32} />

                                    <Text
                                        style={styles.bankName}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>

                                    {isSelected && (
                                        <Check
                                            size={20}
                                            color="#3478E5"
                                            strokeWidth={2.5}
                                        />
                                    )}
                                </Pressable>
                            );
                        }}
                    />
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        zIndex: 100,
        marginBottom: SPACING.lg,
    },

    selector: {
        height: 64,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DCE6F2',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    selectedIcon: {
        width: 36,
        height: 36,
        marginRight: 12,
    },

    selectedText: {
        flex: 1,
        color: '#0B2345',
        fontSize: 16,
        fontWeight: '700',
    },

    placeholder: {
        flex: 1,
        color: '#7A8BA5',
        fontSize: 16,
        fontWeight: '600',
    },

    chevron: {
        marginLeft: 8,
    },

    chevronOpen: {
        transform: [{ rotate: '180deg' }],
    },

    dropdown: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        maxHeight: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#DCE6F2',

        shadowColor: '#0B2345',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,

        elevation: 8,
        overflow: 'hidden',
    },

    bankItem: {
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    bankIcon: {
        width: 34,
        height: 34,
        marginRight: 12,
    },

    bankName: {
        flex: 1,
        color: '#0B2345',
        fontSize: 15,
        fontWeight: '600',
    },

    selectedItem: {
        backgroundColor: '#F1F7FF',
    },

    itemPressed: {
        opacity: 0.7,
    },

    pressed: {
        opacity: 0.8,
    },

    disabled: {
        opacity: 0.5,
    },

    defaultIconContainer: {
        backgroundColor: '#EAF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BankDropdown;