import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Filter,
  Plus,
  Receipt,
  X,
} from 'lucide-react-native';

import { useAppSelector } from '../../store';
import {
  COLORS,
  moderateScale,
  SHADOWS,
} from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import ExpenseCard from '../../components/ExpenseCard';
import BottomNavigation from '../../components/BottomNavigation';

const FILTER_OPTIONS = ['All', 'Synced', 'Pending'] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];

/* =========================================================
   DATE HELPERS
========================================================= */

const startOfDay = (date: Date) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

/**
 * Converts expense.date into a Date.
 *
 * Supports:
 * 1. ISO
 *    2026-09-17T10:30:00.000Z
 *
 * 2. YYYY-MM-DD
 *    2026-09-17
 *
 * 3. DD/MM/YYYY
 *    17/09/2026
 *
 * 4. DD-MM-YYYY
 *    17-09-2026
 *
 * 5. Legacy values
 *    Today, Just now
 *    Today, 10:30 AM
 *    Yesterday, 09:15 AM
 *    12 Sep, 04:45 PM
 */
const getDateOnly = (
  dateValue?: string,
): Date | null => {
  if (!dateValue) {
    return null;
  }

  const value = String(dateValue).trim();

  if (!value) {
    return null;
  }

  const lowerValue = value.toLowerCase();

  /* -------------------------------------------------------
     TODAY
  ------------------------------------------------------- */

  if (lowerValue.startsWith('today')) {
    return startOfDay(new Date());
  }

  /* -------------------------------------------------------
     YESTERDAY
  ------------------------------------------------------- */

  if (lowerValue.startsWith('yesterday')) {
    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1,
    );

    return startOfDay(yesterday);
  }

  /* -------------------------------------------------------
     ISO / YYYY-MM-DD
  ------------------------------------------------------- */

  const isoMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})/,
  );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    const date = new Date(
      year,
      month - 1,
      day,
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return startOfDay(date);
    }
  }

  /* -------------------------------------------------------
     DD/MM/YYYY or DD-MM-YYYY
  ------------------------------------------------------- */

  const dmyMatch = value.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
  );

  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);

    const date = new Date(
      year,
      month - 1,
      day,
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return startOfDay(date);
    }
  }

  /* -------------------------------------------------------
     DD MON / DD MON YYYY
     
     Example:
     12 Sep, 04:45 PM
     12 Sep 2026
  ------------------------------------------------------- */

  const monthNameMatch = value.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})(?:,)?(?:\s+(\d{4}))?/,
  );

  if (monthNameMatch) {
    const day = Number(
      monthNameMatch[1],
    );

    const monthName =
      monthNameMatch[2].toLowerCase();

    const year = monthNameMatch[3]
      ? Number(monthNameMatch[3])
      : new Date().getFullYear();

    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    const monthIndex = months.findIndex(
      month =>
        monthName.startsWith(month),
    );

    if (monthIndex !== -1) {
      const date = new Date(
        year,
        monthIndex,
        day,
      );

      if (
        date.getFullYear() === year &&
        date.getMonth() === monthIndex &&
        date.getDate() === day
      ) {
        return startOfDay(date);
      }
    }
  }

  /* -------------------------------------------------------
     JAVASCRIPT DATE FALLBACK
  ------------------------------------------------------- */

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return startOfDay(parsed);
  }

  return null;
};

/* =========================================================
   DISPLAY HELPERS
========================================================= */

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatGroupDate = (date: Date) => {
  const targetDate =
    startOfDay(date).getTime();

  const today =
    startOfDay(new Date()).getTime();

  const yesterdayDate = new Date();

  yesterdayDate.setDate(
    yesterdayDate.getDate() - 1,
  );

  const yesterday =
    startOfDay(
      yesterdayDate,
    ).getTime();

  if (targetDate === today) {
    return 'TODAY';
  }

  if (targetDate === yesterday) {
    return 'YESTERDAY';
  }

  return date
    .toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
};

/* =========================================================
   SCREEN
========================================================= */

const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const expenses = useAppSelector(
    state => state.expense.expenses,
  );

  const [selectedFilter, setSelectedFilter] =
    useState<FilterOption>('All');

  /* =======================================================
     DATE FILTER STATE
  ======================================================= */

  const [showDateFilter, setShowDateFilter] =
    useState(false);

  const [dateMode, setDateMode] =
    useState<'from' | 'to'>('from');

  const [draftFromDate, setDraftFromDate] =
    useState<Date | null>(null);

  const [draftToDate, setDraftToDate] =
    useState<Date | null>(null);

  const [fromDate, setFromDate] =
    useState<Date | null>(null);

  const [toDate, setToDate] =
    useState<Date | null>(null);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      /* ---------------------------------------------------
         STATUS FILTER
      --------------------------------------------------- */

      const matchesStatus =
        selectedFilter === 'All' ||
        (selectedFilter === 'Synced' &&
          !!expense.synced) ||
        (selectedFilter === 'Pending' &&
          !expense.synced);

      if (!matchesStatus) {
        return false;
      }

      /* ---------------------------------------------------
         NO DATE FILTER
         
         IMPORTANT:
         Don't try to parse dates when there is
         no active date filter.
      --------------------------------------------------- */

      if (!fromDate && !toDate) {
        return true;
      }

      /* ---------------------------------------------------
         DATE FILTER
      --------------------------------------------------- */

      const expenseDate =
        getDateOnly(expense.date);

      if (!expenseDate) {
        return false;
      }

      const expenseTimestamp =
        startOfDay(
          expenseDate,
        ).getTime();

      if (
        fromDate &&
        expenseTimestamp <
        startOfDay(
          fromDate,
        ).getTime()
      ) {
        return false;
      }

      if (
        toDate &&
        expenseTimestamp >
        startOfDay(
          toDate,
        ).getTime()
      ) {
        return false;
      }

      return true;
    });
  }, [
    expenses,
    selectedFilter,
    fromDate,
    toDate,
  ]);

  /* =======================================================
     SORT
  ======================================================= */

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort(
      (a, b) => {
        const dateA =
          getDateOnly(
            a.date,
          )?.getTime() ?? 0;

        const dateB =
          getDateOnly(
            b.date,
          )?.getTime() ?? 0;

        return dateB - dateA;
      },
    );
  }, [filteredExpenses]);

  /* =======================================================
     GROUP BY DATE
  ======================================================= */

  const groupedExpenses = useMemo(() => {
    const groups: Array<{
      dateKey: string;
      date: Date | null;
      data: typeof sortedExpenses;
    }> = [];

    sortedExpenses.forEach(expense => {
      const expenseDate =
        getDateOnly(
          expense.date,
        );

      /* ---------------------------------------------------
         Keep transaction even if date cannot be parsed.
      --------------------------------------------------- */

      if (!expenseDate) {
        const unknownGroup =
          groups.find(
            group =>
              group.dateKey ===
              'unknown-date',
          );

        if (unknownGroup) {
          unknownGroup.data.push(
            expense,
          );
        } else {
          groups.push({
            dateKey:
              'unknown-date',
            date: null,
            data: [expense],
          });
        }

        return;
      }

      const dateKey = [
        expenseDate.getFullYear(),
        expenseDate.getMonth(),
        expenseDate.getDate(),
      ].join('-');

      const existingGroup =
        groups.find(
          group =>
            group.dateKey ===
            dateKey,
        );

      if (existingGroup) {
        existingGroup.data.push(
          expense,
        );
      } else {
        groups.push({
          dateKey,
          date: expenseDate,
          data: [expense],
        });
      }
    });

    return groups;
  }, [sortedExpenses]);

  /* =======================================================
     TOTAL
  ======================================================= */

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount || 0,
        ),
      0,
    );
  }, [filteredExpenses]);

  /* =======================================================
     DATE FILTER
  ======================================================= */

  const hasDateFilter =
    !!fromDate || !!toDate;

  const openDateFilter = () => {
    setDraftFromDate(
      fromDate,
    );

    setDraftToDate(
      toDate,
    );

    setDateMode(
      fromDate && toDate
        ? 'to'
        : 'from',
    );

    setShowDateFilter(
      true,
    );
  };

  const closeDateFilter = () => {
    setShowDateFilter(
      false,
    );
  };

  const clearDateFilter = () => {
    setDraftFromDate(
      null,
    );

    setDraftToDate(
      null,
    );

    setFromDate(
      null,
    );

    setToDate(
      null,
    );

    setShowDateFilter(
      false,
    );
  };

  const applyDateFilter = () => {
    let nextFromDate =
      draftFromDate;

    let nextToDate =
      draftToDate;

    /* Swap if user selected dates backwards */

    if (
      nextFromDate &&
      nextToDate &&
      nextFromDate.getTime() >
      nextToDate.getTime()
    ) {
      const temp =
        nextFromDate;

      nextFromDate =
        nextToDate;

      nextToDate =
        temp;
    }

    setFromDate(
      nextFromDate
        ? startOfDay(
          nextFromDate,
        )
        : null,
    );

    setToDate(
      nextToDate
        ? startOfDay(
          nextToDate,
        )
        : null,
    );

    setShowDateFilter(
      false,
    );
  };

  const handleDateChange = (
    event: any,
    selectedDate?: Date,
  ) => {
    if (
      event?.type ===
      'dismissed' ||
      !selectedDate
    ) {
      return;
    }

    const normalizedDate =
      startOfDay(
        selectedDate,
      );

    if (
      dateMode === 'from'
    ) {
      setDraftFromDate(
        normalizedDate,
      );

      if (
        draftToDate &&
        normalizedDate.getTime() >
        draftToDate.getTime()
      ) {
        setDraftToDate(
          normalizedDate,
        );
      }

      setDateMode('to');
    } else {
      setDraftToDate(
        normalizedDate,
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              SCREEN_NAMES.HOME,
            )
          }
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <ArrowLeft
            size={moderateScale(20)}
            color={COLORS.navy}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Transactions
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            {filteredExpenses.length}{' '}
            records · ₹
            {totalAmount.toLocaleString(
              'en-IN',
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              SCREEN_NAMES.ADD_EXPENSE,
            )
          }
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add Expense"
        >
          <Plus
            size={moderateScale(20)}
            color={COLORS.white}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>

      {/* =================================================
          FILTER ROW
      ================================================= */}

      <View
        style={styles.filterRow}
      >
        <View
          style={
            styles.statusFilters
          }
        >
          {FILTER_OPTIONS.map(
            filter => {
              const isSelected =
                selectedFilter ===
                filter;

              return (
                <Pressable
                  key={filter}
                  onPress={() =>
                    setSelectedFilter(
                      filter,
                    )
                  }
                  style={[
                    styles.filterChip,
                    isSelected &&
                    styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected &&
                      styles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        {/* DATE FILTER */}

        <TouchableOpacity
          onPress={
            openDateFilter
          }
          style={[
            styles.dateFilterButton,
            hasDateFilter &&
            styles.dateFilterButtonActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Filter transactions by date"
        >
          <Filter
            size={moderateScale(18)}
            color={
              hasDateFilter
                ? COLORS.white
                : COLORS.navy
            }
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>

      {/* =================================================
          ACTIVE DATE RANGE
      ================================================= */}

      {hasDateFilter && (
        <View
          style={
            styles.activeDateFilter
          }
        >
          <View
            style={
              styles.activeDateTextContainer
            }
          >
            <Text
              style={
                styles.activeDateLabel
              }
            >
              DATE RANGE
            </Text>

            <Text
              style={
                styles.activeDateText
              }
            >
              {fromDate
                ? formatDate(
                  fromDate,
                )
                : 'Any date'}{' '}
              →{' '}
              {toDate
                ? formatDate(
                  toDate,
                )
                : 'Any date'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={
              clearDateFilter
            }
            style={
              styles.clearDateButton
            }
          >
            <Text
              style={
                styles.clearDateText
              }
            >
              Clear
            </Text>

            <X
              size={moderateScale(15)}
              color={COLORS.navy}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* =================================================
          TRANSACTION LIST
      ================================================= */}

      <View
        style={styles.listContainer}
      >
        {filteredExpenses.length ===
          0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIconCircle
              }
            >
              <Receipt
                size={moderateScale(
                  38,
                )}
                color={COLORS.gray}
                strokeWidth={1.8}
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No Transactions Found
            </Text>

            <Text
              style={
                styles.emptyDesc
              }
            >
              {hasDateFilter
                ? 'No transactions were found for the selected date range.'
                : selectedFilter ===
                  'Pending'
                  ? 'All your transactions are currently synchronized.'
                  : 'Tap the + button above to record a new expense.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={
              groupedExpenses
            }
            keyExtractor={item =>
              item.dateKey
            }
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.listContent
            }
            renderItem={({
              item,
            }) => (
              <View
                style={
                  styles.dateGroup
                }
              >
                {/* DATE HEADER */}

                <View
                  style={
                    styles.dateHeaderRow
                  }
                >
                  <View
                    style={
                      styles.dateHeaderLine
                    }
                  />

                  <Text
                    style={
                      styles.dateHeaderText
                    }
                  >
                    {item.date
                      ? formatGroupDate(
                        item.date,
                      )
                      : 'DATE NOT AVAILABLE'}
                  </Text>

                  <View
                    style={
                      styles.dateHeaderLine
                    }
                  />
                </View>

                {/* TRANSACTIONS */}

                {item.data.map(
                  expense => (
                    <ExpenseCard
                      key={
                        expense.id
                      }
                      expense={
                        expense
                      }
                      onPress={() => {
                        navigation.navigate(
                          SCREEN_NAMES.EXPENSE_DETAILS,
                          {
                            expenseId:
                              expense.id,
                          },
                        );
                      }}
                    />
                  ),
                )}
              </View>
            )}
          />
        )}
      </View>

      {/* =================================================
          BOTTOM NAV
      ================================================= */}

      <BottomNavigation
        activeTab="transactions"
      />

      {/* =================================================
          DATE FILTER MODAL
      ================================================= */}

      <Modal
        visible={
          showDateFilter
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeDateFilter
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              styles.modalBackdrop
            }
            onPress={
              closeDateFilter
            }
          />

          <View
            style={
              styles.dateModal
            }
          >
            {/* MODAL HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Filter by Date
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select the transaction
                  period
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  closeDateFilter
                }
                style={
                  styles.modalCloseButton
                }
              >
                <X
                  size={moderateScale(
                    20,
                  )}
                  color={COLORS.navy}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </View>

            {/* FROM / TO */}

            <View
              style={
                styles.dateSelectionRow
              }
            >
              <TouchableOpacity
                onPress={() =>
                  setDateMode(
                    'from',
                  )
                }
                style={[
                  styles.dateSelectionCard,
                  dateMode ===
                  'from' &&
                  styles.dateSelectionCardActive,
                ]}
              >
                <Text
                  style={
                    styles.dateSelectionLabel
                  }
                >
                  FROM
                </Text>

                <Text
                  style={
                    styles.dateSelectionValue
                  }
                >
                  {draftFromDate
                    ? formatDate(
                      draftFromDate,
                    )
                    : 'Select date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setDateMode(
                    'to',
                  )
                }
                style={[
                  styles.dateSelectionCard,
                  dateMode === 'to' &&
                  styles.dateSelectionCardActive,
                ]}
              >
                <Text
                  style={
                    styles.dateSelectionLabel
                  }
                >
                  TO
                </Text>

                <Text
                  style={
                    styles.dateSelectionValue
                  }
                >
                  {draftToDate
                    ? formatDate(
                      draftToDate,
                    )
                    : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DATE PICKER */}

            <View
              style={
                styles.pickerContainer
              }
            >
              <DateTimePicker
                value={
                  dateMode === 'from'
                    ? draftFromDate ||
                    new Date()
                    : draftToDate ||
                    draftFromDate ||
                    new Date()
                }
                mode="date"
                display={
                  Platform.OS === 'ios'
                    ? 'inline'
                    : 'calendar'
                }
                onChange={
                  handleDateChange
                }
                maximumDate={
                  new Date()
                }
              />
            </View>

            {/* ACTIONS */}

            <View
              style={
                styles.modalActions
              }
            >
              <TouchableOpacity
                onPress={
                  clearDateFilter
                }
                style={
                  styles.clearModalButton
                }
              >
                <Text
                  style={
                    styles.clearModalButtonText
                  }
                >
                  Clear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  applyDateFilter
                }
                style={
                  styles.applyButton
                }
              >
                <Text
                  style={
                    styles.applyButtonText
                  }
                >
                  Apply Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionsScreen;

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      moderateScale(16),
    paddingVertical:
      moderateScale(12),
    backgroundColor:
      COLORS.background,
  },

  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius:
      moderateScale(19),
    backgroundColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft:
      moderateScale(14),
  },

  headerTitle: {
    fontSize:
      moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize:
      moderateScale(12),
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 2,
  },

  addButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius:
      moderateScale(19),
    backgroundColor:
      COLORS.expense,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },

  /* FILTER */

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      moderateScale(16),
    paddingVertical:
      moderateScale(8),
    gap: moderateScale(8),
  },

  statusFilters: {
    flex: 1,
    flexDirection: 'row',
    gap: moderateScale(8),
  },

  filterChip: {
    paddingHorizontal:
      moderateScale(14),
    paddingVertical:
      moderateScale(6),
    borderRadius:
      moderateScale(18),
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      'rgba(219, 237, 240, 0.9)',
  },

  filterChipActive: {
    backgroundColor:
      COLORS.petrol,
    borderColor:
      COLORS.petrol,
  },

  filterChipText: {
    fontSize:
      moderateScale(12),
    fontWeight: '600',
    color: COLORS.navy,
  },

  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },

  dateFilterButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius:
      moderateScale(18),
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      'rgba(219, 237, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateFilterButtonActive: {
    backgroundColor:
      COLORS.petrol,
    borderColor:
      COLORS.petrol,
  },

  /* ACTIVE DATE */

  activeDateFilter: {
    marginHorizontal:
      moderateScale(16),
    marginBottom:
      moderateScale(6),
    paddingHorizontal:
      moderateScale(12),
    paddingVertical:
      moderateScale(8),
    borderRadius:
      moderateScale(12),
    backgroundColor:
      'rgba(219, 245, 248, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  activeDateTextContainer: {
    flex: 1,
  },

  activeDateLabel: {
    fontSize:
      moderateScale(9),
    fontWeight: '800',
    color: COLORS.petrol,
    letterSpacing: 0.6,
  },

  activeDateText: {
    marginTop: 2,
    fontSize:
      moderateScale(12),
    fontWeight: '700',
    color: COLORS.navy,
  },

  clearDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(3),
    paddingHorizontal:
      moderateScale(7),
    paddingVertical:
      moderateScale(5),
  },

  clearDateText: {
    fontSize:
      moderateScale(11),
    fontWeight: '700',
    color: COLORS.navy,
  },

  /* LIST */

  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal:
      moderateScale(16),
    paddingTop:
      moderateScale(10),
    paddingBottom:
      moderateScale(95),
  },

  dateGroup: {
    marginBottom:
      moderateScale(14),
  },

  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:
      moderateScale(9),
    gap: moderateScale(8),
  },

  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor:
      'rgba(135, 153, 161, 0.25)',
  },

  dateHeaderText: {
    fontSize:
      moderateScale(10),
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 0.8,
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:
      moderateScale(32),
  },

  emptyIconCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius:
      moderateScale(35),
    backgroundColor:
      'rgba(219, 245, 248, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:
      moderateScale(14),
  },

  emptyTitle: {
    fontSize:
      moderateScale(16),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom:
      moderateScale(4),
  },

  emptyDesc: {
    fontSize:
      moderateScale(13),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
    textAlignVertical: 'center',
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    backgroundColor:
      'rgba(0, 0, 0, 0.35)',
  },

  dateModal: {
    backgroundColor:
      COLORS.background,
    borderTopLeftRadius:
      moderateScale(24),
    borderTopRightRadius:
      moderateScale(24),
    paddingHorizontal:
      moderateScale(18),
    paddingTop:
      moderateScale(18),
    paddingBottom:
      moderateScale(
        Platform.OS === 'ios'
          ? 28
          : 18,
      ),
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom:
      moderateScale(14),
  },

  modalTitle: {
    fontSize:
      moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
  },

  modalSubtitle: {
    marginTop:
      moderateScale(2),
    fontSize:
      moderateScale(12),
    color: COLORS.gray,
  },

  modalCloseButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius:
      moderateScale(18),
    backgroundColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* DATE SELECTION */

  dateSelectionRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginBottom:
      moderateScale(8),
  },

  dateSelectionCard: {
    flex: 1,
    paddingHorizontal:
      moderateScale(12),
    paddingVertical:
      moderateScale(10),
    borderRadius:
      moderateScale(12),
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      'rgba(219, 237, 240, 0.9)',
  },

  dateSelectionCardActive: {
    borderColor:
      COLORS.petrol,
  },

  dateSelectionLabel: {
    fontSize:
      moderateScale(9),
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 0.7,
  },

  dateSelectionValue: {
    marginTop:
      moderateScale(3),
    fontSize:
      moderateScale(12),
    fontWeight: '700',
    color: COLORS.navy,
  },

  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight:
      moderateScale(230),
  },

  /* MODAL ACTIONS */

  modalActions: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginTop:
      moderateScale(4),
  },

  clearModalButton: {
    flex: 1,
    height: moderateScale(46),
    borderRadius:
      moderateScale(13),
    backgroundColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(219, 237, 240, 0.9)',
  },

  clearModalButtonText: {
    fontSize:
      moderateScale(13),
    fontWeight: '700',
    color: COLORS.navy,
  },

  applyButton: {
    flex: 2,
    height: moderateScale(46),
    borderRadius:
      moderateScale(13),
    backgroundColor:
      COLORS.petrol,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonText: {
    fontSize:
      moderateScale(13),
    fontWeight: '800',
    color: COLORS.white,
  },
});